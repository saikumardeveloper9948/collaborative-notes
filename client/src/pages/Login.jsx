import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useToast from '../contexts/useToast';
const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        login(data.data.user, data.data.token);
        showToast('Login successful!', 'success');
        navigate('/dashboard');
      } else {
        showToast(data.message || 'Login failed', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-orange-200 via-pink-200 to-purple-300 opacity-80"></div>
      {/* Helical Animated SVG */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <svg width="100%" height="100%" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-spin-slow">
          <defs>
            <linearGradient id="helixGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <path d="M0,400 Q360,200 720,400 T1440,400" stroke="url(#helixGradient)" strokeWidth="16" fill="none">
            <animate attributeName="d" values="M0,400 Q360,200 720,400 T1440,400;M0,400 Q360,600 720,400 T1440,400;M0,400 Q360,200 720,400 T1440,400" dur="6s" repeatCount="indefinite"/>
          </path>
          <path d="M0,500 Q360,700 720,500 T1440,500" stroke="url(#helixGradient)" strokeWidth="10" fill="none" opacity="0.5">
            <animate attributeName="d" values="M0,500 Q360,700 720,500 T1440,500;M0,500 Q360,300 720,500 T1440,500;M0,500 Q360,700 720,500 T1440,500" dur="7s" repeatCount="indefinite"/>
          </path>
        </svg>
      </div>
      {/* Animated SVG Wave */}
      <div className="absolute bottom-0 left-0 w-full h-[20vh] -z-10 pointer-events-none">
        <svg
          viewBox="0 0 1440 320"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="w-full h-full"cd = "true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradient)"
            fillOpacity="1"
            d="M0,224L48,202.7C96,181,192,139,288,144C384,149,480,203,576,197.3C672,192,768,128,864,117.3C960,107,1056,149,1152,176C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
      {/* Login Card */}
      <div className="max-w-md w-auto p-10 space-y-6 bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl z-10 border-4 border-transparent bg-clip-padding hover:scale-105 transition-transform duration-300 group relative before:absolute before:inset-0 before:rounded-2xl before:border-4 before:border-gradient-to-r before:from-orange-400 before:via-pink-400 before:to-purple-400 before:opacity-80 before:blur-md before:-z-10">
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-6 drop-shadow-lg">Login</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-bold text-pink-500">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-2 mt-1 w-full rounded-md bg-gradient-to-r from-orange-100/70 via-pink-100/70 to-purple-100/70 border-2 border-transparent focus:border-pink-400 focus:ring-2 focus:ring-pink-300 placeholder-pink-400 text-pink-700 shadow-md transition-all duration-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-bold text-purple-500">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="px-4 py-2 mt-1 w-full rounded-md bg-gradient-to-r from-orange-100/70 via-pink-100/70 to-purple-100/70 border-2 border-transparent focus:border-purple-400 focus:ring-2 focus:ring-purple-300 placeholder-purple-400 text-purple-700 shadow-md transition-all duration-300 pr-12"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-pink-500 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Eye icon (visible)
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  // Eye-off icon (hidden)
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.362-2.568A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.364 6.364L19.07 4.93" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-semibold text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors duration-200 border-0 flex items-center justify-center"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;