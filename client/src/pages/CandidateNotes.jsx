import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const CandidateNotes = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [candidate, setCandidate] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [users, setUsers] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCandidate = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/candidates/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidate(data.data.candidate);
      }
    } catch {
      showToast('Error fetching candidate details', 'error');
    }
  }, [id, showToast]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/notes/candidate/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.data.notes);
      } else {
        setError('Failed to fetch notes');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const initializeSocket = useCallback(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      },
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      newSocket.emit('join-candidate-room', id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      showToast('Connection error. Please refresh the page.', 'error');
    });

    newSocket.on('note-created', (data) => {
      setNotes(prev => [...prev, data.note]);
      showToast(`New note from ${data.author}`, 'default');
    });

    newSocket.on('note-updated', (data) => {
      setNotes(prev => prev.map(note => 
        note._id === data.note._id ? data.note : note
      ));
    });

    newSocket.on('user-typing', (data) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }, 3000);
      }
    });

    socketRef.current = newSocket;
  }, [id, user.id, showToast]);

  useEffect(() => {
    fetchCandidate();
    fetchNotes();
    fetchUsers();
    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [fetchCandidate, fetchNotes, fetchUsers, initializeSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [notes]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewNote(value);

    const lastAtSymbol = value.lastIndexOf('@');
    if (lastAtSymbol !== -1) {
      const afterAt = value.slice(lastAtSymbol + 1);
      setShowMentions(true);
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(afterAt.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setShowMentions(false);
    }

    if (socketRef.current) {
      socketRef.current.emit('typing-start', { candidateId: id });
    }
  };

  const handleMentionSelect = (selectedUser) => {
    const lastAtSymbol = newNote.lastIndexOf('@');
    const beforeAt = newNote.slice(0, lastAtSymbol);
    setNewNote(`${beforeAt}@${selectedUser.name} `);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ candidateId: id, content: newNote }),
      });
      const data = await response.json();
      if (response.ok) {
        setNewNote('');
        showToast('Note added successfully', 'success');
        fetchNotes();
      } else {
        setError(data.message || 'Failed to add note');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-slate-900 to-secondary-950">
        {/* Vibrant animated spinner */}
        <svg className="animate-spin h-16 w-16" viewBox="0 0 50 50">
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <circle
            className="opacity-20"
            cx="25"
            cy="25"
            r="20"
            stroke="#e0e7ef"
            strokeWidth="6"
            fill="none"
          />
          <path
            d="M25 5 a 20 20 0 0 1 0 40 a 20 20 0 0 1 0 -40"
            stroke="url(#spinnerGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 via-indigo-900 to-cyan-900 text-white flex flex-col items-center py-8 px-2">
      {/* Sticky Header */}
      <div className="sticky top-0 w-full z-30 flex justify-center">
        <div className="w-full max-w-2xl bg-gradient-to-br from-fuchsia-800/60 via-indigo-800/60 to-cyan-800/60 backdrop-blur-xl rounded-b-2xl p-6 shadow-2xl border-b-4 border-fuchsia-400/40">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent mb-2 drop-shadow-lg">{candidate.name}</h2>
          <p className="text-cyan-200 font-semibold">{candidate.position}</p>
          <p className="text-fuchsia-200 font-medium">{candidate.email}</p>
        </div>
      </div>
      {/* Notes Section */}
      <div className="w-full max-w-2xl mb-6">
        <div className="bg-gradient-to-r from-fuchsia-700/30 via-indigo-700/30 to-cyan-700/30 text-fuchsia-200 font-bold mb-2 rounded-t-xl px-4 py-2 shadow-md">Notes</div>
        <div className="space-y-4">
          {notes.length === 0 && !loading && (
            <div className="text-cyan-200 text-center">No notes yet.</div>
          )}
          {notes.map(note => (
            <div key={note._id} className="bg-gradient-to-br from-fuchsia-800/60 via-indigo-800/60 to-cyan-800/60 backdrop-blur-xl border-2 border-fuchsia-400/20 rounded-xl p-4 shadow-xl flex flex-col gap-2">
              <div className="flex items-center gap-2 justify-between">
                <span className="font-bold bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">{note.author?.name || 'Unknown'}</span>
                <span className="text-xs text-cyan-200">{new Date(note.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-white/90">{note.content}</div>
              {note.mentions && note.mentions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {note.mentions.map(m => (
                    <span key={m._id} className="bg-gradient-to-r from-fuchsia-700/30 via-indigo-700/30 to-cyan-700/30 text-cyan-200 px-2 py-1 rounded-full text-xs font-bold shadow">@{m.name}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleAddNote} className="mt-4">
          <textarea
            className="w-full p-3 border-2 border-transparent rounded-xl bg-gradient-to-r from-fuchsia-800/40 via-indigo-800/40 to-cyan-800/40 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300 placeholder-fuchsia-300 text-fuchsia-100 shadow-md transition-all duration-300"
            rows={3}
            placeholder="Add a note..."
            value={newNote}
            onChange={handleInputChange}
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-6 py-2 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-indigo-500 text-white font-bold rounded-xl hover:from-fuchsia-600 hover:to-cyan-600 transition-all duration-300 shadow-xl hover:shadow-fuchsia-500/40 cursor-pointer sm:w-auto"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2 inline-block text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : 'Add Note'}
          </button>
        </form>
        {error && <div className="bg-fuchsia-100/80 border border-fuchsia-400 text-fuchsia-900 px-4 py-2 rounded relative text-sm mb-2 mt-2">{error}</div>}
        {/* Mentions Dropdown */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute z-10 bg-gradient-to-r from-fuchsia-900/90 via-indigo-900/90 to-cyan-900/90 border border-fuchsia-400/40 rounded-md mt-2 w-64 max-h-40 overflow-y-auto shadow-lg">
            {filteredUsers.map(user => (
              <div
                key={user._id}
                className="px-4 py-2 hover:bg-gradient-to-r hover:from-fuchsia-700/40 hover:via-indigo-700/40 hover:to-cyan-700/40 cursor-pointer text-cyan-200 font-bold"
                onClick={() => handleMentionSelect(user)}
              >
                {user.name}
              </div>
            ))}
          </div>
        )}
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="text-xs text-cyan-200 mt-2 font-bold">
            {typingUsers.map(u => u.name).join(', ')} typing...
          </div>
        )}
      </div>
      <div ref={messagesEndRef} />
      <Link to="/dashboard" className="mt-4 w-full max-w-xs">
        <button className="w-full px-6 py-2 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-indigo-500 text-white font-bold rounded-xl hover:from-fuchsia-600 hover:to-cyan-600 transition-all duration-300 shadow-xl hover:shadow-fuchsia-500/40">
          Back to Dashboard
        </button>
      </Link>
    </div>
  );
};

export default CandidateNotes;