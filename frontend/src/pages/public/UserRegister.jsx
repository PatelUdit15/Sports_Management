import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  PartyPopper,
} from 'lucide-react';
import publicService from '../../services/publicService';

export default function UserRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    birthday: '',
    phone: '',
    gender: 'Male',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal Pop-up state
  const [showCreatedModal, setShowCreatedModal] = useState(false);
  const [registeredUserName, setRegisteredUserName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) {
      setError('Please provide your full name');
      return;
    }
    if (!form.email.trim()) {
      setError('Please provide a valid email');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.age) {
      setError('Please provide your age');
      return;
    }
    if (!form.birthday) {
      setError('Please select your birthday');
      return;
    }

    setLoading(true);
    try {
      const res = await publicService.registerMember({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        age: parseInt(form.age, 10),
        birthday: form.birthday,
        phone: form.phone.trim(),
        gender: form.gender,
      });

      if (res.success) {
        // Save current member in local storage
        const memberData = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          age: form.age,
          birthday: form.birthday,
          gender: form.gender,
        };
        localStorage.setItem('currentMember', JSON.stringify(memberData));

        // Set registered name and open pop-up modal
        setRegisteredUserName(form.fullName.trim());
        setShowCreatedModal(true);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err?.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToClubs = () => {
    setShowCreatedModal(false);
    navigate('/user/clubs');
  };

  return (
    <div className="min-h-screen bg-[#0F0C20] text-gray-100 flex flex-col justify-between selection:bg-[#8B5CF6] selection:text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-purple-600/20 via-pink-600/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

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
              <div className="text-[10px] text-gray-400 font-medium">Member Registration</div>
            </div>
          </Link>

          <Link
            to="/user/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </header>

      {/* Main Registration Form */}
      <main className="max-w-xl w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent border border-white/15 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-3">
              <Sparkles size={14} className="text-amber-400" />
              <span>Step 1: General Member Profile</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Create Member Account</h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2">
              Enter your general details to create your sports platform profile.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  id="reg-fullname"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Johnathan Vance"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    id="reg-email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    id="reg-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Age, Birthday & Gender Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Age *
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  id="reg-age"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="24"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Birthday *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    id="reg-birthday"
                    value={form.birthday}
                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                    className="w-full px-3.5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Gender
                </label>
                <select
                  id="reg-gender"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#1D1836] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Non-Binary / Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="reg-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-9 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="reg-confirm-password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  required
                  className="w-4 h-4 rounded accent-purple-500"
                />
                <span>I agree to Skyline Sports Club terms of service &amp; community guidelines</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              id="submit-register-btn"
              className="w-full mt-4 py-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#EC4899] shadow-xl shadow-purple-600/40 hover:shadow-purple-600/60 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account &amp; Proceed to Clubs</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/user/login" className="font-bold text-purple-400 hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </main>

      {/* ── Pop-Up Modal: Account Created (Required by User Prompt) ── */}
      {showCreatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-md w-full rounded-3xl p-8 bg-gradient-to-b from-[#1C1736] to-[#120E26] border-2 border-purple-500/40 shadow-2xl shadow-purple-600/40 text-center animate-scale-up">
            {/* Ambient burst */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full pointer-events-none -z-10" />

            {/* Celebration Icon */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 p-0.5 mx-auto mb-5 shadow-lg shadow-purple-500/50">
              <div className="w-full h-full bg-[#120E26] rounded-[22px] flex items-center justify-center">
                <PartyPopper size={38} className="text-amber-300 animate-bounce" />
              </div>
            </div>

            {/* Pop-up Heading */}
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider mb-2">
              ✓ Account Created Successfully
            </span>

            {/* Personalized greeting message required: "and add a message there with the user name saying hi." */}
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Hi {registeredUserName}! 👋
            </h2>

            <p className="text-sm text-gray-300 mt-3 leading-relaxed">
              Your member account has been registered successfully.
            </p>
            <p className="text-xs text-purple-300/80 mt-1">
              Next, let's explore all the sports clubs connected to our network and select your Gold, Silver, or Bronze membership!
            </p>

            {/* Modal Continue Button */}
            <button
              type="button"
              id="modal-continue-to-clubs-btn"
              onClick={handleContinueToClubs}
              className="w-full mt-7 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#EC4899] shadow-xl shadow-purple-600/40 hover:shadow-purple-600/60 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Sports Clubs &amp; Memberships</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 border-t border-white/10 text-center text-xs text-gray-500">
        Skyline Sports Club • Member Account Verification
      </footer>
    </div>
  );
}
