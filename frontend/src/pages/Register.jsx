import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-darkBg transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Glassmorphic decor */}
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary-500/10 blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-accent-500/10 blur-xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Sign up to order fresh products to your doorstep!
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-1.5">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Annu Rajawat"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
              <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="annu@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-1.5">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-primary-600 hover:bg-primary-500 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-bold shadow-md hover:shadow-lg transition flex items-center justify-center group"
          >
            {loading ? 'Creating Account...' : (
              <>
                Register Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 relative z-10">
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirect}`} className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
