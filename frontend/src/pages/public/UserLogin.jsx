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
        if (res.token || res.user?.token) {
          const t = res.token || res.user.token;
          localStorage.setItem('token', t);
          localStorage.setItem('member_token', t);
        }
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
    <div className="min-h-screen bg-[#F5F6FA] text-gray-900 flex flex-col justify-between selection:bg-[#714B67] selection:text-white relative">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-[#E5E7EB] bg-white shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#714B67] flex items-center justify-center shadow-xs">
              <Trophy size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-gray-900 tracking-tight">Skyline Sports Club</div>
              <div className="text-[10px] text-gray-500 font-medium">User &amp; Member Portal</div>
            </div>
          </Link>

          <Link
            to="/get-started"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#714B67] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
          >
            <ChevronLeft size={16} /> Change Role Selection
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        <div className="rounded-2xl p-8 bg-white border border-[#E5E7EB] shadow-xs">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-3">
              <User size={22} className="text-[#714B67]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">User / Member Sign In</h1>
            <p className="text-xs text-gray-500 mt-1">
              Enter your User ID and password to access your member account.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID or Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                User ID or Email *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  id="user-login-identifier"
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                  placeholder="e.g. SSC-2026 or member@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="user-login-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              id="user-signin-btn"
              className="w-full mt-2 py-3 rounded-lg font-bold text-sm text-white bg-[#714B67] hover:bg-[#57344f] shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-semibold tracking-wider">
                New User / Member?
              </span>
            </div>
          </div>

          {/* Create Account Option Button */}
          <div>
            <p className="text-xs text-gray-500 text-center mb-3">
              Don't have an account yet? Register your profile in under 1 minute.
            </p>
            <button
              type="button"
              id="btn-goto-create-account"
              onClick={() => navigate('/user/register')}
              className="w-full py-2.5 rounded-lg font-bold text-xs text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus size={15} className="text-[#714B67]" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Quick Help */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Are you a club owner or staff?{' '}
          <Link to="/login" className="text-[#714B67] hover:underline font-semibold">
            Admin Sign In
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[#E5E7EB] bg-white text-center text-xs text-gray-500">
        Skyline Sports Club • User Account Security &amp; Encryption
      </footer>
    </div>
  );
}
