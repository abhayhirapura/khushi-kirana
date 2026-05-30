import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail) {
      return setForgotError('Please enter your email.');
    }

    try {
      // Mock API link sent success
      setForgotSuccess('A password recovery email has been sent to your inbox (Mocked).');
      setForgotEmail('');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-darkBg transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        
        {/* Glassmorphic decor */}
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary-500/10 blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-accent-500/10 blur-xl pointer-events-none"></div>

        {!showForgot ? (
          <>
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Welcome Back</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Log in to shop fresh groceries and track orders!
              </p>
            </div>

            {error && (
              <div className="p-3 mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-bold shadow-md hover:shadow-lg transition flex items-center justify-center group"
              >
                {loading ? 'Logging you in...' : (
                  <>
                    Log In <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500 relative z-10">
              Don't have an account?{' '}
              <Link to={`/register?redirect=${redirect}`} className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                Create one now
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Recover Password</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Enter your email address and we'll send you a password recovery link.
              </p>
            </div>

            {forgotError && (
              <div className="p-3 mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 mb-6 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs">
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-555 text-white font-bold shadow-md transition"
              >
                Send Recovery Link
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 font-medium hover:underline"
              >
                Back to Login
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default Login;
