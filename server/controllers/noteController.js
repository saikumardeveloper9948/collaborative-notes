const Note = require('../models/Note');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Notification = require('../models/Notification');

// Get notes for a candidate
const getCandidateNotes = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    const notes = await Note.find({ candidateId })
      .populate('author', 'name email')
      .populate('mentions', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Note.countDocuments({ candidateId });

    res.json({
      success: true,
      data: {
        notes,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get candidate notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create note
const createNote = async (req, res) => {
  try {
    const { candidateId, content, parentNote } = req.body;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Extract mentions from content
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1];
      const user = await User.findOne({ 
        name: { $regex: new RegExp(`^${username}$`, 'i') }, 
        isActive: true 
      });
      if (user) {
        mentions.push(user._id);
      }
    }

    const note = new Note({
      candidateId,
      author: req.user.userId,
      content,
      mentions,
      parentNote: parentNote || null
    });

    await note.save();
    await note.populate('author', 'name email');
    await note.populate('mentions', 'name email');

    // Create notifications for mentions
    if (mentions.length > 0) {
      const notifications = mentions.map(userId => ({
        recipient: userId,
        sender: req.user.userId,
        candidate: candidateId,
        note: note._id,
        type: 'mention',
        message: `${req.user.name} mentioned you in a note about ${candidate.name}`
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update note
const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    if (note.author.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own notes'
      });
    }

    // Extract mentions from content
    const mentionRegex = /@(\w+)/g;
    const newMentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1];
      const user = await User.findOne({ 
        name: { $regex: new RegExp(`^${username}$`, 'i') }, 
        isActive: true 
      });
      if (user) {
        newMentions.push(user._id);
      }
    }

    // Find new mentions that weren't in the original note
    const newMentionIds = newMentions.filter(id => 
      !note.mentions.some(mentionId => mentionId.toString() === id.toString())
    );

    note.content = content;
    note.mentions = newMentions;
    await note.save();
    await note.populate('author', 'name email');
    await note.populate('mentions', 'name email');

    // Create notifications for new mentions
    if (newMentionIds.length > 0) {
      const candidate = await Candidate.findById(note.candidateId);
      const notifications = newMentionIds.map(userId => ({
        recipient: userId,
        sender: req.user.userId,
        candidate: note.candidateId,
        note: note._id,
        type: 'mention',
        message: `${req.user.name} mentioned you in a note about ${candidate.name}`
      }));
      await Notification.insertMany(notifications);
    }

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete note
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    if (note.author.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own notes'
      });
    }

    await Note.findByIdAndDelete(noteId);

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Toggle note highlight
const toggleHighlight = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.isHighlighted = !note.isHighlighted;
    await note.save();

    res.json({
      success: true,
      message: 'Note highlight toggled successfully',
      data: { isHighlighted: note.isHighlighted }
    });
  } catch (error) {
    console.error('Toggle highlight error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getCandidateNotes,
  createNote,
  updateNote,
  deleteNote,
  toggleHighlight
}; 