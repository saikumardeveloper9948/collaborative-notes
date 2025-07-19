import { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useToast from '../contexts/useToast';
const apiUrl = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '', position: '' });
  const { showToast } = useToast();

  const fetchCandidates = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/candidates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.data?.candidates || []);
      } else {
        showToast('Failed to fetch candidates', 'error');
        console.error('Failed to fetch candidates:', response.status);
        setCandidates([]);
      }
    } catch {
      showToast('Error fetching candidates', 'error');
      console.error('Error fetching candidates:', 'error');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data?.notifications || []);
      } else {
        showToast('Failed to fetch notifications', 'error');
        console.error('Failed to fetch notifications:', response.status);
        setNotifications([]);
      }
    } catch {
      showToast('Error fetching notifications', 'error');
      console.error('Error fetching notifications:', 'error');
      setNotifications([]);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCandidates();
    fetchNotifications();
  }, [fetchCandidates, fetchNotifications]);

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCandidate)
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates([...candidates, data.data.candidate]);
        setNewCandidate({ name: '', email: '', position: '' });
        setShowCreateForm(false);
        showToast('Candidate created successfully!', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to create candidate', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully!', 'success');
  };

  if (loading) {
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
    <div className="bg-gradient-to-br from-fuchsia-900 via-indigo-900 to-cyan-900 min-h-screen text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-fuchsia-700/80 via-indigo-800/80 to-cyan-700/80 backdrop-blur-xl shadow-2xl border-b-4 border-fuchsia-400/40 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row justify-between items-start py-6 space-y-0 w-full sm:flex-row">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg">
                Welcome back, {user.name}....!
              </h1>
              <p className="text-cyan-200 text-sm sm:text-base font-medium">Manage your candidates and view notifications</p>
            </div>
            {/* Logout button for desktop/tablet */}
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-pink-500 via-fuchsia-600 to-red-500 hover:from-fuchsia-700 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-fuchsia-500/40 border-2 border-fuchsia-400/40 hidden sm:block"
            >
              Logout
            </button>
            {/* Logout icon for mobile with tooltip */}
            <div className="relative block sm:hidden ml-2">
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-pink-500 via-fuchsia-600 to-red-500 hover:from-fuchsia-700 hover:to-red-700 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-fuchsia-500/40 border-2 border-fuchsia-400/40"
                aria-label="Logout"
                onBlur={(e) => e.target.blur()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                </svg>
                <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-xs text-white opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="bg-gradient-to-br from-fuchsia-800/60 via-indigo-800/60 to-cyan-800/60 backdrop-blur-2xl rounded-2xl shadow-2xl border-2 border-fuchsia-400/30 p-6 sm:p-8 transition-all duration-300 hover:border-fuchsia-300/60 hover:shadow-fuchsia-500/30">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg">
                    Candidates
                  </h2>
                  <p className="text-cyan-200 mt-1 font-medium">Manage your recruitment pipeline</p>
                </div>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-indigo-500 hover:from-fuchsia-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-fuchsia-500/40 border-2 border-fuchsia-400/40 flex items-center space-x-2"
                >
                  <span className="">{showCreateForm ? 'Cancel' : '+'}</span>
                  <span>{showCreateForm ? '' : 'Add Candidate'}</span>
                </button>
              </div>

              {/* Create Candidate Form */}
              {showCreateForm && (
                <div className="mb-8 p-6 bg-gradient-to-br from-fuchsia-900/80 via-indigo-900/80 to-cyan-900/80 backdrop-blur-xl rounded-xl border-2 border-fuchsia-400/30 animate-fadeIn shadow-lg shadow-fuchsia-500/20">
                  <form onSubmit={handleCreateCandidate} className="space-y-4">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-fuchsia-200">Name</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newCandidate.name}
                          onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                          className="w-full pl-4 pr-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-fuchsia-400/20 rounded-xl text-white placeholder-fuchsia-300 transition-all duration-300 focus:outline-none focus:border-fuchsia-400 focus:bg-fuchsia-900/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-cyan-200">Email</label>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={newCandidate.email}
                          onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                          className="w-full pl-4 pr-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-cyan-400/20 rounded-xl text-white placeholder-cyan-300 transition-all duration-300 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-indigo-200">Position</label>
                        <input
                          type="text"
                          placeholder="Job Position"
                          value={newCandidate.position}
                          onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                          className="w-full pl-4 pr-4 py-3 bg-white/10 backdrop-blur-sm border-2 border-indigo-400/20 rounded-xl text-white placeholder-indigo-300 transition-all duration-300 focus:outline-none focus:border-indigo-400 focus:bg-indigo-900/20"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 hover:from-green-500 hover:to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-emerald-500/30 border-2 border-emerald-400/40"
                      >
                        Create Candidate
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Candidates List */}
              <div className="space-y-4">
                {(!candidates || candidates.length === 0) ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-fuchsia-700 via-indigo-700 to-cyan-700 rounded-full flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                      <svg className="w-10 h-10 text-fuchsia-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-extrabold text-fuchsia-200 mb-2">No candidates yet</h3>
                    <p className="text-cyan-200 mb-4">Create your first candidate to get started!</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-fuchsia-500/40 border-2 border-fuchsia-400/40"
                    >
                      Add Your First Candidate
                    </button>
                  </div>
                ) : (
                  candidates.map((candidate, index) => (
                    <div
                      key={candidate._id}
                      className="bg-gradient-to-r from-fuchsia-900/60 via-indigo-900/60 to-cyan-900/60 border-2 border-fuchsia-400/20 rounded-xl p-6 hover:shadow-2xl hover:shadow-fuchsia-500/30 transition-all duration-300 transform hover:scale-[1.04] hover:bg-fuchsia-900/80 animate-fadeInUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-fuchsia-500/30">
                              {candidate.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-xl font-extrabold text-fuchsia-200 drop-shadow-lg">{candidate.name}</h3>
                              <p className="text-cyan-200 font-medium">{candidate.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm text-indigo-200 bg-fuchsia-700/30 px-3 py-1 rounded-full font-bold">
                              {candidate.position}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              candidate.status === 'active' ? 'bg-green-500/30 text-green-200' :
                              candidate.status === 'hired' ? 'bg-blue-500/30 text-blue-200' :
                              candidate.status === 'rejected' ? 'bg-red-500/30 text-red-200' :
                              'bg-gray-500/30 text-gray-200'
                            }`}>
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                candidate.status === 'active' ? 'bg-green-400' :
                                candidate.status === 'hired' ? 'bg-blue-400' :
                                candidate.status === 'rejected' ? 'bg-red-400' :
                                'bg-gray-400'
                              }`}></span>
                              {candidate.status}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/candidate/${candidate._id}`}
                          className="bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-indigo-500 hover:from-fuchsia-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-110 shadow-xl hover:shadow-fuchsia-500/40 border-2 border-fuchsia-400/40 whitespace-nowrap"
                        >
                          View Notes
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Notifications Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-gradient-to-br from-fuchsia-800/60 via-indigo-800/60 to-cyan-800/60 backdrop-blur-2xl rounded-2xl shadow-2xl border-2 border-fuchsia-400/30 p-6 transition-all duration-300 hover:border-fuchsia-300/60 hover:shadow-fuchsia-500/30 sticky top-28">
              <h2 className="text-xl font-extrabold bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent mb-6 drop-shadow-lg">
                Notifications
              </h2>
              <div className="space-y-4">
                {(!notifications || notifications.length === 0) ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-fuchsia-700 via-indigo-700 to-cyan-700 rounded-full flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                      <svg className="w-6 h-6 text-fuchsia-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-cyan-200 text-sm font-medium">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div
                      key={notification._id}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-110 animate-fadeInUp ${
                        notification.isRead 
                          ? 'bg-gradient-to-r from-fuchsia-900/40 via-indigo-900/40 to-cyan-900/40 border-fuchsia-400/20' 
                          : 'bg-gradient-to-r from-fuchsia-500/30 via-cyan-500/30 to-indigo-500/30 border-fuchsia-400/40 shadow-xl shadow-fuchsia-500/20'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {notification.type === 'mention' && notification.sender && (
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-fuchsia-500/30">
                            {notification.sender.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-fuchsia-200">{notification.sender.name}</div>
                            <div className="text-xs text-cyan-200">{notification.sender.email}</div>
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-fuchsia-100 mb-2 font-bold">{notification.message}</p>
                      <p className="text-xs text-cyan-200 mb-2 font-medium">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                      {notification.candidate && (
                        <Link
                          to={`/candidate/${notification.candidate._id}`}
                          className="text-xs text-fuchsia-300 hover:text-fuchsia-100 font-bold transition-colors duration-200 flex items-center space-x-1"
                        >
                          <span>View candidate</span>
                          <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;