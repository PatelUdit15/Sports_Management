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
    <div className="min-h-screen bg-[#F5F6FA] text-gray-900 flex flex-col justify-between selection:bg-[#714B67] selection:text-white relative">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-[#E5E7EB] bg-white shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#714B67] flex items-center justify-center shadow-xs">
              <Trophy size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-gray-900 tracking-tight">Skyline Sports Club</div>
              <div className="text-[10px] text-gray-500 font-medium">Platform Role Selection</div>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#714B67] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
          >
            <ChevronLeft size={16} /> Back to Club Showcase
          </Link>
        </div>
      </header>

      {/* Main Choice Section */}
      <main className="max-w-5xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold text-[#714B67] mx-auto mb-4">
          <Sparkles size={14} className="text-amber-500" />
          <span>Get Started with Skyline Sports</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          How would you like to get started?
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-xl mx-auto">
          Please select your role below to create your account or sign in to your dedicated portal.
        </p>

        {/* The Two Main Interactive Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 text-left">
          {/* Option 1: User / Member */}
          <div className="relative rounded-2xl p-8 bg-white border border-[#E5E7EB] hover:border-[#714B67] hover:shadow-md transition-all duration-200 flex flex-col justify-between group shadow-xs">
            <div className="absolute top-4 right-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 text-[#714B67] border border-purple-200">
                For Athletes &amp; Members
              </span>
            </div>

            <div>
              <div className="w-13 h-13 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <User size={26} className="text-[#714B67]" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#714B67] transition-colors">
                Create Account being a User
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed">
                Join our network of sports clubs. Browse clubs, select Gold, Silver, or Bronze membership, complete your payment, and receive your official digital Member ID pass.
              </p>

              <div className="space-y-2.5 mt-6 border-t border-gray-100 pt-5">
                {[
                  'Browse all connected sports clubs & courts',
                  'Select Gold, Silver, or Bronze membership tiers',
                  'Instant digital Member ID generation upon payment',
                  'Seamless court bookings and facility access',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-700">
                    <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
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
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#714B67] hover:bg-[#57344f] shadow-xs hover:shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Create Account being a User</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          {/* Option 2: Club Owner */}
          <div className="relative rounded-2xl p-8 bg-white border border-[#E5E7EB] hover:border-amber-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group shadow-xs">
            <div className="absolute top-4 right-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                For Club Management
              </span>
            </div>

            <div>
              <div className="w-13 h-13 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Building2 size={26} className="text-amber-700" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                Create Account being a Club Owner
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed">
                Set up and manage your own sports facility on the Skyline SaaS platform. Configure courts, manage staff &amp; HR, track accounting, inventory, and members.
              </p>

              <div className="space-y-2.5 mt-6 border-t border-gray-100 pt-5">
                {[
                  'Modular setup: Courts, Shop, Café, HR, Accounting',
                  'Automated role assignment for staff & receptionists',
                  'Multi-tenant isolated club database & analytics',
                  'Member management and revenue reporting',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-700">
                    <CheckCircle2 size={15} className="text-amber-600 flex-shrink-0" />
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
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-xs hover:shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Create Account being a Club Owner</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Existing Accounts Quick Access */}
        <div className="mt-10 text-center text-xs text-gray-500">
          Already have an existing staff or admin account?{' '}
          <Link to="/login" className="font-bold text-[#714B67] hover:underline underline-offset-4">
            Sign In to Staff / Admin Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[#E5E7EB] bg-white text-center text-xs text-gray-500">
        Skyline Sports Club SaaS Platform • Enterprise Multi-Tenant Architecture
      </footer>
    </div>
  );
}
