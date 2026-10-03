import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  ChevronLeft,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import publicService from '../../services/publicService';

export default function UserLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    identifier: '', // User ID or Email
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.identifier.trim()) {
      setError('Please enter your User ID or Email');
      return;
    }
    if (!form.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await publicService.loginMember({
        email: form.identifier.trim(),
        password: form.password,
      });

      if (res.success) {
        // Save member session
        localStorage.setItem('currentMember', JSON.stringify(res.user));
        // Redirect to clubs directory
        navigate('/user/clubs');
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      // If no account exists yet, inform user they can click Create Account
      setError(
        err?.message ||
        'Account not found. Click "Create Account" below to register your new member profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0C20] text-gray-100 flex flex-col justify-between selection:bg-[#8B5CF6] selection:text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-pink-600/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="px-6 py-5 border-b border-white/10 backdrop-blur-md bg-[#0F0C20]/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] p-0.5 shadow-md shadow-purple-500/30">
              <div className="w-full h-full bg-[#0F0C20] rounded-[10px] flex items-center justify-center">
                <Trophy size={18} className="text-[#A855F7]" />
              </div>
            </div>
            <div>
              <div className="text-[16px] font-bold text-white tracking-tight">Skyline Sports Club</div>
              <div className="text-[10px] text-gray-400 font-medium">User &amp; Member Portal</div>
            </div>
          </Link>

          <Link
            to="/get-started"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={16} /> Change Role Selection
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="rounded-3xl p-8 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent border border-white/15 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
              <User size={22} className="text-purple-300" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">User / Member Sign In</h1>
            <p className="text-xs text-gray-400 mt-1">
              Enter your User ID and password to access your member account.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID or Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                User ID or Email *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  id="user-login-identifier"
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                  placeholder="e.g. SSC-2026 or member@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="user-login-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              id="user-signin-btn"
              className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#EC4899] shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Member</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#171329] px-3 text-gray-400 font-bold tracking-wider">
                New User / Member?
              </span>
            </div>
          </div>

          {/* Create Account Option Button */}
          <div>
            <p className="text-xs text-gray-400 text-center mb-3">
              Don't have a member ID or account yet? Register your profile in under 1 minute.
            </p>
            <button
              type="button"
              id="btn-goto-create-account"
              onClick={() => navigate('/user/register')}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-purple-200 bg-white/5 hover:bg-white/10 border border-purple-500/30 hover:border-purple-500/60 shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <UserPlus size={16} className="text-purple-400" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Quick Help */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Are you a club owner or staff?{' '}
          <Link to="/login" className="text-purple-400 hover:underline font-semibold">
            Admin Sign In
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-white/10 text-center text-xs text-gray-500">
        Skyline Sports Club • User Account Security &amp; Encryption
      </footer>
    </div>
  );
}
