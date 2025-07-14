import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Generate star positions once
  const stars = useMemo(() => (
    Array.from({ length: 40 }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 1.5 + Math.random() * 1.5,
      delay: Math.random() * 5
    }))
  ), []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Registration successful! Please log in.', 'success');
        navigate('/login');
      } else {
        showToast(data.message || 'Registration failed', 'error');
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
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-fuchsia-900 via-indigo-900 to-cyan-900 opacity-90"></div>
      {/* CSS Animated Star Field - covers entire screen */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10">
        {stars.map((star, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>
      {/* Register Card */}
      <div className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl p-8 space-y-6 bg-gradient-to-br from-fuchsia-800/80 via-indigo-800/80 to-cyan-800/80 rounded-2xl shadow-2xl border-2 border-fuchsia-400/30 z-10">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent mb-6 drop-shadow-lg">Register</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-bold text-fuchsia-200">Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              autoComplete="name"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="px-4 py-2 mt-1 border-2 border-fuchsia-400/40 rounded-lg w-full focus:ring-2 focus:ring-cyan-400 focus:border-indigo-400 bg-white/10 backdrop-blur-sm text-white placeholder-fuchsia-300 transition-all duration-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-bold text-cyan-200">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-2 mt-1 border-2 border-cyan-400/40 rounded-lg w-full focus:ring-2 focus:ring-fuchsia-400 focus:border-indigo-400 bg-white/10 backdrop-blur-sm text-white placeholder-cyan-300 transition-all duration-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-bold text-indigo-200">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="new-password"
              required
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className="px-4 py-2 mt-1 border-2 border-indigo-400/40 rounded-lg w-full focus:ring-2 focus:ring-fuchsia-400 focus:border-cyan-400 bg-white/10 backdrop-blur-sm text-white placeholder-indigo-300 transition-all duration-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-fuchsia-200">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              autoComplete="new-password"
              required
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="px-4 py-2 mt-1 border-2 border-fuchsia-400/40 rounded-lg w-full focus:ring-2 focus:ring-cyan-400 focus:border-indigo-400 bg-white/10 backdrop-blur-sm text-white placeholder-fuchsia-300 transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-bold text-white bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-indigo-500 rounded-lg hover:from-fuchsia-600 hover:to-cyan-600 transition-all duration-200 border-0 flex items-center justify-center shadow-lg shadow-fuchsia-500/30"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : null}
            {loading ? 'Signing up...' : 'Signup'}
          </button>
        </form>
        <p className="text-sm text-center text-cyan-200">
          Already have an account?{' '}
          <Link to="/login" className="text-fuchsia-300 font-bold hover:underline">Log in</Link>
        </p>
        {/* <p className="text-sm text-center text-cyan-200 mt-2">
          Forgot your password?{' '}
          <span className="text-indigo-300 font-bold hover:underline cursor-pointer">Reset Password</span>
        </p> */}
      </div>
    </div>
  );
};

export default Register;

<style>
{`
.star {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #fff;
  border-radius: 50%;
  opacity: 1;
  box-shadow: 0 0 12px 4px #fff;
  animation: twinkle 2.5s infinite alternate;
}
@keyframes twinkle {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}
`}
</style>