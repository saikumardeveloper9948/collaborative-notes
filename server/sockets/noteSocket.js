const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Note = require('../models/Note');
const Candidate = require('../models/Candidate');
const Notification = require('../models/Notification');

class NoteSocket {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.candidateRooms = new Map(); // candidateId -> Set of userIds
  }

  initialize() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      this.connectedUsers.set(socket.user._id.toString(), socket.id);
      socket.join(`user:${socket.user._id}`);
      socket.on('join-candidate-room', async (candidateId) => {
        await this.joinCandidateRoom(socket, candidateId);
      });
      socket.on('leave-candidate-room', (candidateId) => {
        this.leaveCandidateRoom(socket, candidateId);
      });
      socket.on('new-note', async (data) => {
        await this.handleNewNote(socket, data);
      });
      socket.on('update-note', async (data) => {
        await this.handleUpdateNote(socket, data);
      });
      socket.on('delete-note', async (data) => {
        await this.handleDeleteNote(socket, data);
      });
      socket.on('highlight-note', async (data) => {
        await this.handleHighlightNote(socket, data);
      });
      socket.on('typing-start', (data) => {
        this.handleTypingStart(socket, data);
      });
      socket.on('typing-stop', (data) => {
        this.handleTypingStop(socket, data);
      });
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  async joinCandidateRoom(socket, candidateId) {
    try {
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        socket.emit('error', { message: 'Candidate not found' });
        return;
      }
      socket.join(`candidate:${candidateId}`);
      if (!this.candidateRooms.has(candidateId)) {
        this.candidateRooms.set(candidateId, new Set());
      }
      this.candidateRooms.get(candidateId).add(socket.user._id.toString());
      socket.to(`candidate:${candidateId}`).emit('user-joined', {
        userId: socket.user._id,
        userName: socket.user.name,
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('error', { message: 'Error joining candidate room' });
    }
  }

  leaveCandidateRoom(socket, candidateId) {
    socket.leave(`candidate:${candidateId}`);
    if (this.candidateRooms.has(candidateId)) {
      this.candidateRooms.get(candidateId).delete(socket.user._id.toString());
      if (this.candidateRooms.get(candidateId).size === 0) {
        this.candidateRooms.delete(candidateId);
      }
    }
    socket.to(`candidate:${candidateId}`).emit('user-left', {
      userId: socket.user._id,
      userName: socket.user.name,
      timestamp: new Date()
    });
  }

  async handleNewNote(socket, data) {
    try {
      const { candidateId, content, parentNote } = data;
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        socket.emit('error', { message: 'Candidate not found' });
        return;
      }
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
        const username = match[1];
        const user = await User.findOne({ name: { $regex: new RegExp(`^${username}$`, 'i') }, isActive: true });
        if (user) {
          mentions.push(user._id);
        }
      }
      const note = new Note({
        candidateId,
        author: socket.user._id,
        content,
        mentions,
        parentNote: parentNote || null
      });
      await note.save();
      await note.populate('author', 'name email');
      await note.populate('mentions', 'name email');
      socket.to(`candidate:${candidateId}`).emit('note-created', {
        note,
        author: socket.user.name,
        timestamp: new Date()
      });
      if (mentions.length > 0) {
        const notifications = mentions.map(userId => ({
          recipient: userId,
          sender: socket.user._id,
          candidate: candidateId,
          note: note._id,
          type: 'mention',
          message: `${socket.user.name} mentioned you in a note about ${candidate.name}`
        }));
        await Notification.insertMany(notifications);
        mentions.forEach(userId => {
          const userSocketId = this.connectedUsers.get(userId.toString());
          if (userSocketId) {
            this.io.to(userSocketId).emit('notification', {
              type: 'mention',
              message: `${socket.user.name} mentioned you in a note about ${candidate.name}`,
              candidateId,
              noteId: note._id,
              timestamp: new Date()
            });
          }
        });
      }
    } catch (error) {
      socket.emit('error', { message: 'Error creating note' });
    }
  }

  async handleUpdateNote(socket, data) {
    try {
      const { noteId, content } = data;
      const note = await Note.findById(noteId);
      if (!note) {
        socket.emit('error', { message: 'Note not found' });
        return;
      }
      if (note.author.toString() !== socket.user._id.toString()) {
        socket.emit('error', { message: 'You can only edit your own notes' });
        return;
      }
      const mentionRegex = /@(\w+)/g;
      const newMentions = [];
      let match;
      while ((match = mentionRegex.exec(content)) !== null) {
        const username = match[1];
        const user = await User.findOne({ name: { $regex: new RegExp(`^${username}$`, 'i') }, isActive: true });
        if (user) {
          newMentions.push(user._id);
        }
      }
      const newMentionIds = newMentions.filter(id => !note.mentions.some(mentionId => mentionId.toString() === id.toString()));
      note.content = content;
      note.mentions = newMentions;
      await note.save();
      await note.populate('author', 'name email');
      await note.populate('mentions', 'name email');
      socket.to(`candidate:${note.candidateId}`).emit('note-updated', {
        note,
        author: socket.user.name,
        timestamp: new Date()
      });
      if (newMentionIds.length > 0) {
        const candidate = await Candidate.findById(note.candidateId);
        const notifications = newMentionIds.map(userId => ({
          recipient: userId,
          sender: socket.user._id,
          candidate: note.candidateId,
          note: note._id,
          type: 'mention',
          message: `${socket.user.name} mentioned you in a note about ${candidate.name}`
        }));
        await Notification.insertMany(notifications);
        newMentionIds.forEach(userId => {
          const userSocketId = this.connectedUsers.get(userId.toString());
          if (userSocketId) {
            this.io.to(userSocketId).emit('notification', {
              type: 'mention',
              message: `${socket.user.name} mentioned you in a note about ${candidate.name}`,
              candidateId: note.candidateId,
              noteId: note._id,
              timestamp: new Date()
            });
          }
        });
      }
    } catch (error) {
      socket.emit('error', { message: 'Error updating note' });
    }
  }

  async handleDeleteNote(socket, data) {
    try {
      const { noteId } = data;
      const note = await Note.findById(noteId);
      if (!note) {
        socket.emit('error', { message: 'Note not found' });
        return;
      }
      if (note.author.toString() !== socket.user._id.toString()) {
        socket.emit('error', { message: 'You can only delete your own notes' });
        return;
      }
      await Note.findByIdAndDelete(noteId);
      socket.to(`candidate:${note.candidateId}`).emit('note-deleted', {
        noteId,
        author: socket.user.name,
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('error', { message: 'Error deleting note' });
    }
  }

  async handleHighlightNote(socket, data) {
    try {
      const { noteId } = data;
      const note = await Note.findById(noteId);
      if (!note) {
        socket.emit('error', { message: 'Note not found' });
        return;
      }
      note.isHighlighted = !note.isHighlighted;
      await note.save();
      socket.to(`candidate:${note.candidateId}`).emit('note-highlighted', {
        noteId,
        isHighlighted: note.isHighlighted,
        author: socket.user.name,
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('error', { message: 'Error highlighting note' });
    }
  }

  handleTypingStart(socket, data) {
    const { candidateId } = data;
    socket.to(`candidate:${candidateId}`).emit('user-typing-start', {
      userId: socket.user._id,
      userName: socket.user.name
    });
  }

  handleTypingStop(socket, data) {
    const { candidateId } = data;
    socket.to(`candidate:${candidateId}`).emit('user-typing-stop', {
      userId: socket.user._id,
      userName: socket.user.name
    });
  }

  handleDisconnect(socket) {
    this.connectedUsers.delete(socket.user._id.toString());
    this.candidateRooms.forEach((users, candidateId) => {
      if (users.has(socket.user._id.toString())) {
        users.delete(socket.user._id.toString());
        socket.to(`candidate:${candidateId}`).emit('user-left', {
          userId: socket.user._id,
          userName: socket.user.name,
          timestamp: new Date()
        });
        if (users.size === 0) {
          this.candidateRooms.delete(candidateId);
        }
      }
    });
  }
}

module.exports = NoteSocket; 