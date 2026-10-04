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
              <div className="text-[10px] text-gray-500 font-medium">Member Registration</div>
            </div>
          </Link>

          <Link
            to="/user/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#714B67] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
          >
            <ChevronLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </header>

      {/* Main Registration Form */}
      <main className="max-w-xl w-full mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        <div className="rounded-2xl p-8 bg-white border border-[#E5E7EB] shadow-xs">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold text-[#714B67] mb-2">
              <Sparkles size={14} className="text-amber-500" />
              <span>Step 1: General Member Profile</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Member Account</h1>
            <p className="text-xs text-gray-500 mt-1">
              Enter your general details to create your sports platform profile.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  id="reg-fullname"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Johnathan Vance"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                />
              </div>
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    id="reg-email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    id="reg-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Age, Birthday & Gender Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Birthday *
                </label>
                <input
                  type="date"
                  required
                  id="reg-birthday"
                  value={form.birthday}
                  onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="reg-gender"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="reg-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    id="reg-confirm-password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  required
                  className="w-4 h-4 rounded accent-[#714B67]"
                />
                <span>I agree to Skyline Sports Club terms of service &amp; community guidelines</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              id="submit-register-btn"
              className="w-full mt-3 py-3 rounded-lg font-bold text-sm text-white bg-[#714B67] hover:bg-[#57344f] shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account &amp; Proceed to Clubs</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/user/login" className="font-bold text-[#714B67] hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </main>

      {/* ── Pop-Up Modal: Account Created ── */}
      {showCreatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative max-w-md w-full rounded-2xl p-8 bg-white border border-[#E5E7EB] shadow-2xl text-center">
            {/* Celebration Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <PartyPopper size={32} className="text-amber-600" />
            </div>

            {/* Pop-up Heading */}
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              ✓ Account Created Successfully
            </span>

            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              Hi {registeredUserName}! 👋
            </h2>

            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Your member account has been registered successfully.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Next, let's explore all the sports clubs connected to our network and select your Gold, Silver, or Bronze membership!
            </p>

            {/* Modal Continue Button */}
            <button
              type="button"
              id="modal-continue-to-clubs-btn"
              onClick={handleContinueToClubs}
              className="w-full mt-6 py-3 rounded-xl font-bold text-sm text-white bg-[#714B67] hover:bg-[#57344f] shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Sports Clubs &amp; Memberships</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 border-t border-[#E5E7EB] bg-white text-center text-xs text-gray-500">
        Skyline Sports Club • Member Account Verification
      </footer>
    </div>
  );
}
