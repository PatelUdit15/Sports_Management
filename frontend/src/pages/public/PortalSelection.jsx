import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  User,
  Building2,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F0C20] text-gray-100 flex flex-col justify-between selection:bg-[#8B5CF6] selection:text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-purple-600/20 via-pink-600/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="px-6 py-6 border-b border-white/10 backdrop-blur-md bg-[#0F0C20]/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] p-0.5 shadow-md shadow-purple-500/30">
              <div className="w-full h-full bg-[#0F0C20] rounded-[10px] flex items-center justify-center">
                <Trophy size={18} className="text-[#A855F7]" />
              </div>
            </div>
            <div>
              <div className="text-[16px] font-bold text-white tracking-tight">Skyline Sports Club</div>
              <div className="text-[10px] text-gray-400 font-medium">SaaS Platform Selection</div>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={16} /> Back to Club Showcase
          </Link>
        </div>
      </header>

      {/* Main Choice Section */}
      <main className="max-w-5xl mx-auto px-4 py-16 flex-1 flex flex-col justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-purple-300 mx-auto mb-4">
          <Sparkles size={14} className="text-amber-400" />
          <span>Get Started with Skyline Sports</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          How would you like to get started?
        </h1>

        <p className="text-sm sm:text-base text-gray-300 mt-3 max-w-xl mx-auto">
          Please select your role below to create your account or sign in to your dedicated portal.
        </p>

        {/* The Two Main Interactive Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 text-left">
          {/* Option 1: User / Member */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-transparent border border-white/15 hover:border-purple-400/60 transition-all duration-300 hover:scale-[1.02] shadow-2xl flex flex-col justify-between group">
            <div className="absolute top-4 right-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                For Athletes &amp; Members
              </span>
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500/30 to-pink-500/20 border border-purple-500/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User size={28} className="text-purple-300" />
              </div>

              <h2 className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">
                Create Account being a User
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed">
                Join our network of sports clubs. Browse clubs, select Gold, Silver, or Bronze membership, complete your payment, and receive your official digital Member ID pass.
              </p>

              <div className="space-y-2.5 mt-6 border-t border-white/10 pt-5">
                {[
                  'Browse all connected sports clubs & courts',
                  'Select Gold, Silver, or Bronze membership tiers',
                  'Instant digital Member ID generation upon payment',
                  'Seamless court bookings and facility access',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                id="btn-select-user"
                onClick={() => navigate('/user/login')}
                className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#EC4899] shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 flex items-center justify-center gap-2.5 group-hover:translate-y-[-2px] transition-all"
              >
                <span>Create Account being a User</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          {/* Option 2: Club Owner */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-b from-white/[0.07] via-white/[0.03] to-transparent border border-white/15 hover:border-amber-400/60 transition-all duration-300 hover:scale-[1.02] shadow-2xl flex flex-col justify-between group">
            <div className="absolute top-4 right-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                For Club Management
              </span>
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-orange-500/20 border border-amber-500/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 size={28} className="text-amber-300" />
              </div>

              <h2 className="text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                Create Account being a Club Owner
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed">
                Set up and manage your own sports facility on the Skyline SaaS platform. Configure courts, manage staff &amp; HR, track accounting, inventory, and members.
              </p>

              <div className="space-y-2.5 mt-6 border-t border-white/10 pt-5">
                {[
                  'Modular setup: Courts, Shop, Café, HR, Accounting',
                  'Automated role assignment for staff & receptionists',
                  'Multi-tenant isolated club database & analytics',
                  'Member management and revenue reporting',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 size={15} className="text-amber-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                id="btn-select-club-owner"
                onClick={() => navigate('/signup')}
                className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 flex items-center justify-center gap-2.5 group-hover:translate-y-[-2px] transition-all"
              >
                <span>Create Account being a Club Owner</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Existing Accounts Quick Access */}
        <div className="mt-12 text-center text-xs text-gray-400">
          Already have an existing staff or admin account?{' '}
          <Link to="/login" className="font-bold text-purple-400 hover:text-purple-300 underline underline-offset-4">
            Sign In to Staff / Admin Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-gray-500">
        Skyline Sports Club SaaS Platform • Enterprise Multi-Tenant Architecture
      </footer>
    </div>
  );
}
