import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Activity,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Flame,
  Shield,
  Coffee,
  ShoppingBag,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  Star,
  Zap,
} from 'lucide-react';

export default function SkylineLanding() {
  const navigate = useNavigate();

  const facilities = [
    {
      icon: '🏸',
      title: 'Olympic Badminton Arena',
      desc: '8 BWF-certified synthetic courts with 800-lux shadowless LED lighting and climate control.',
      features: ['Shock-absorbent wooden sub-flooring', 'Advance electronic booking', 'BWF certified standards'],
      highlight: '8 Courts',
    },
    {
      icon: '🎾',
      title: 'Championship Tennis & Padel',
      desc: '4 US Open grade acrylic hard courts and 2 panoramic crystal-glass padel arenas.',
      features: ['Day & night tournament floodlights', 'Ball machine training sessions', 'Padel racquets rental'],
      highlight: '6 Total Arenas',
    },
    {
      icon: '🏊‍♂️',
      title: 'Olympic 50m Aquatic Center',
      desc: 'Heated 8-lane 50m swimming pool maintained at optimal 27°C with UV filtration.',
      features: ['Dedicated lap & speed lanes', 'Certified life-guards on deck', 'Junior swim academy'],
      highlight: '50m Heated',
    },
    {
      icon: '🏋️‍♂️',
      title: 'High-Performance Gym & CrossFit',
      desc: '8,000 sq ft conditioning facility with Technogym biomechanical equipment and CrossFit rig.',
      features: ['Free weights up to 50kg', 'Cardio cinema zone', 'Resident certified trainers'],
      highlight: '8,000 Sq Ft',
    },
    {
      icon: '☕',
      title: 'Skyline Sports Bar & Café',
      desc: 'Nutritionist-curated meals, organic smoothies, protein bowls, artisan coffee, and live match screenings.',
      features: ['Post-workout macro meals', 'Giant 4K match screens', 'Outdoor terrace lounge'],
      highlight: 'Health & Social',
    },
    {
      icon: '🛍️',
      title: 'Pro Shop & 24hr Stringing',
      desc: 'Authorized retailer for Yonex, Wilson, Babolat and Head with electronic racquet stringing.',
      features: ['Demo racquets testing', 'Latest athletic footwear', 'Same-day stringing service'],
      highlight: 'Official Gear',
    },
    {
      icon: '🧖',
      title: 'Recovery, Sauna & Cryo Spa',
      desc: 'Deep recovery center featuring Finnish saunas, eucalyptus steam rooms, and ice recovery tubs.',
      features: ['Contrast water therapy', 'Sports massage & physiotherapy', 'Private member locker suites'],
      highlight: 'Wellness Suite',
    },
    {
      icon: '🏆',
      title: 'Elite Junior & Adult Academy',
      desc: 'Year-round development programs, corporate leagues, seasonal camps, and sanctioned club tourneys.',
      features: ['Ex-national player coaches', 'Progress tracking reports', 'Club league ranking system'],
      highlight: 'Pro Coaching',
    },
  ];

  const plans = [
    {
      tier: 'BRONZE',
      name: 'Bronze Social Play',
      price: '₹1,499',
      period: 'per month',
      badge: 'Essential Access',
      desc: 'Ideal for recreational players enjoying off-peak courts and club social community.',
      color: 'border-amber-200 bg-amber-50/30',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      features: [
        'Off-peak court access (Weekdays 6 AM - 4 PM)',
        'Standard locker room & shower facilities',
        'Invitations to club social events & mixer leagues',
        'Digital Member ID with instant mobile access',
      ],
      popular: false,
    },
    {
      tier: 'GOLD',
      name: 'Gold All-Access VIP',
      price: '₹4,999',
      period: 'per month',
      badge: '★ Most Popular • VIP',
      desc: 'The complete athletic experience with unrestricted court access, pool, gym, and VIP privileges.',
      color: 'border-purple-300 bg-gradient-to-b from-purple-50/60 to-white shadow-md ring-2 ring-purple-500/20',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
      features: [
        'Unlimited peak & off-peak court bookings (All sports)',
        '7-day advance court priority reservations',
        'All-inclusive Olympic Pool & Performance Gym',
        '2 Personal training / coaching consultations / mo',
        '25% discount at Skyline Sports Café & Pro Shop',
        'VIP lounge access + 2 complimentary guest passes / mo',
      ],
      popular: true,
    },
    {
      tier: 'SILVER',
      name: 'Silver Court & Fitness',
      price: '₹2,999',
      period: 'per month',
      badge: 'Active Athlete',
      desc: 'Perfect for athletes wanting regular court play combined with full gym and pool access.',
      color: 'border-slate-200 bg-slate-50/40',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      features: [
        'Standard & peak court access (up to 2 hrs/day)',
        '3-day advance court priority booking',
        'Full access to Performance Gym & Sauna suite',
        'Locker room, steam room & towel service',
        '10% discount at Pro Shop & Sports Café',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-gray-900 font-sans selection:bg-[#714B67] selection:text-white">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-[#E5E7EB] shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-[#714B67] p-0.5 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <div className="text-[17px] font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
                Skyline Sports Club
                <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-purple-100 text-[#714B67] border border-purple-200">
                  Arena
                </span>
              </div>
              <div className="text-[11px] text-gray-500 font-medium">World-Class Athletic & Social Club</div>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-gray-600">
            <a href="#about" className="hover:text-[#714B67] transition-colors">About Club</a>
            <a href="#facilities" className="hover:text-[#714B67] transition-colors">Facilities</a>
            <a href="#memberships" className="hover:text-[#714B67] transition-colors">Memberships</a>
            <a href="#amenities" className="hover:text-[#714B67] transition-colors">Amenities</a>
            <a href="#contact" className="hover:text-[#714B67] transition-colors">Visit Us</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/user/login"
              className="text-[13px] font-semibold text-gray-700 hover:text-[#714B67] px-3.5 py-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              Member Sign In
            </Link>
            <Link
              to="/get-started"
              id="nav-get-started-btn"
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[13px] text-white bg-[#714B67] hover:bg-[#57344f] shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-white via-[#F5F6FA] to-[#F5F6FA] border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[12px] font-semibold text-[#714B67] mb-6 shadow-xs">
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            <span>Welcome to Skyline Sports Club • Premium Sports Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-gray-900">
            Where Champions Play &amp; <br className="hidden sm:block" />
            <span className="text-[#714B67]">
              Athletic Dreams Thrive
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 mt-6 leading-relaxed font-normal">
            Experience state-of-the-art courts, Olympic aquatic arenas, high-performance training, and a vibrant member community at <strong>Skyline Sports Club</strong>. Everything your sports passion deserves under one roof.
          </p>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 my-8 text-xs font-semibold text-gray-700">
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center gap-1.5">
              🏸 8 Badminton Courts
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center gap-1.5">
              🎾 4 Tennis & 2 Padel
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center gap-1.5">
              🏊 50m Heated Pool
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center gap-1.5">
              🏋️ Performance Gym
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center gap-1.5">
              ☕ Sports Café & Bar
            </span>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
            <Link
              to="/get-started"
              id="hero-get-started-btn"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-[15px] text-white bg-[#714B67] hover:bg-[#57344f] shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started Now</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#facilities"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-[14px] text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-xs transition-all text-center"
            >
              Explore Club Facilities
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto pt-10 border-t border-gray-200">
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="text-3xl font-extrabold text-gray-900">12+</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">Championship Courts</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="text-3xl font-extrabold text-[#714B67]">3,500+</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">Active Club Members</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="text-3xl font-extrabold text-pink-600">15+</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">National Certified Coaches</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
              <div className="text-3xl font-extrabold text-emerald-600">99.4%</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">Member Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#714B67] mb-3">
                <Trophy size={13} className="text-[#714B67]" />
                <span>ABOUT SKYLINE SPORTS CLUB</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                An Iconic Destination for Sports, Wellness &amp; Fellowship
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mt-4 leading-relaxed">
                Founded with a mission to bring world-class athletic facilities to players of all ages and levels, <strong>Skyline Sports Club</strong> stands as the flagship sports destination in the city. From international-standard courts and Olympic-spec pools to youth academies and family recreation, we bring excellence and hospitality together.
              </p>
              <div className="space-y-3 mt-6">
                {[
                  'Multi-sport infrastructure built to BWF, ITF, and FINA specifications',
                  'Flexible memberships across Gold, Silver, and Bronze tiers with zero hidden fees',
                  'Modern mobile-friendly booking system, digital passes, and instant locker access',
                  'Vibrant social calendar including weekly leagues, club tournaments, and clinics',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={17} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-gray-700 font-medium leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Card / Highlights */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center border border-purple-200">
                    <Activity size={24} className="text-[#714B67]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Club Operating Hours</h3>
                    <p className="text-xs text-gray-500">Open 7 days a week, 365 days a year</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  Open Now
                </span>
              </div>

              <div className="space-y-3 text-xs font-medium border-t border-gray-200 pt-4">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Courts & Indoor Arenas</span>
                  <span className="text-gray-900 font-bold">6:00 AM – 11:00 PM</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Aquatic Center & Pool</span>
                  <span className="text-gray-900 font-bold">5:30 AM – 10:00 PM</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Gym & CrossFit Studio</span>
                  <span className="text-gray-900 font-bold">24/7 Access (Gold & Silver)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Sports Café & Lounge</span>
                  <span className="text-gray-900 font-bold">7:00 AM – 11:30 PM</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Pro Shop & Stringing Center</span>
                  <span className="text-gray-900 font-bold">8:00 AM – 9:00 PM</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  📍 Plot 42, Olympic Boulevard, Sports City
                </div>
                <Link
                  to="/get-started"
                  className="text-xs font-bold text-[#714B67] hover:text-[#57344f] flex items-center gap-1"
                >
                  Join Club <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Offer Section ── */}
      <section id="facilities" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F6FA] border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#714B67] mb-3">
              <Zap size={13} className="text-amber-500" />
              <span>EVERYTHING AT SKYLINE SPORTS CLUB</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              World-Class Facilities &amp; Amenities
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-4">
              Designed by architects and athletes to deliver an unmatched standard of training, performance, social bonding, and recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((fac, idx) => (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl bg-white hover:bg-purple-50/20 border border-gray-200 hover:border-purple-300 transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5 shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-2.5 rounded-xl bg-gray-50 border border-gray-200 group-hover:scale-105 transition-transform">
                      {fac.icon}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#714B67] border border-purple-200">
                      {fac.highlight}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#714B67] transition-colors">
                    {fac.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {fac.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 space-y-1.5">
                  {fac.features.map((feat, fIdx) => (
                    <div key={fIdx} className="text-[11px] text-gray-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#714B67]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Membership Tiers Showcase ── */}
      <section id="memberships" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700 mb-3">
              <Award size={13} className="text-amber-500" />
              <span>TRANSPARENT MEMBERSHIP TIERS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Choose the Plan That Fits Your Game
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-4">
              All memberships include digital member ID card, mobile app booking access, and priority club reservations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-8 border ${p.color} flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                  p.popular ? 'border-2 border-[#714B67]' : 'border-gray-200'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#714B67] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase text-[#714B67]">
                      {p.tier} TIER
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-2 min-h-[32px]">{p.desc}</p>

                  <div className="my-6 pb-6 border-b border-gray-200">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">{p.price}</span>
                      <span className="text-xs text-gray-500 font-medium">/{p.period}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-bold text-gray-800 uppercase tracking-wider">Plan Inclusions:</div>
                    {p.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-600">
                        <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    to="/get-started"
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      p.popular
                        ? 'bg-[#714B67] hover:bg-[#57344f] text-white shadow-sm'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                    }`}
                  >
                    <span>Select {p.tier} Plan</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom Call To Action ── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 via-white to-purple-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 p-0.5 mx-auto mb-6 flex items-center justify-center shadow-xs">
            <Trophy size={28} className="text-[#714B67]" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Ready to Join Skyline Sports Club?
          </h2>

          <p className="text-base text-gray-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            Create your account in seconds, choose your preferred sports club in our network, and get instant access to premium courts, pools, gym, and member privileges.
          </p>

          <div className="mt-8">
            <Link
              to="/get-started"
              id="bottom-get-started-btn"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base text-white bg-[#714B67] hover:bg-[#57344f] shadow-sm hover:shadow-md hover:scale-105 active:scale-[0.98] transition-all group"
            >
              <span>Get Started</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Instant digital activation • Seamless mobile access • Cancel or upgrade anytime
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" className="py-12 px-4 sm:px-6 lg:px-8 bg-white text-xs text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#714B67] flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <div>
              <div className="text-gray-900 font-bold text-sm">Skyline Sports Club</div>
              <div className="text-[11px] text-gray-500">Enterprise Sports Management Platform</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600 font-medium">
            <Link to="/get-started" className="hover:text-[#714B67] transition-colors">Portal Selection</Link>
            <Link to="/user/login" className="hover:text-[#714B67] transition-colors">Member Login</Link>
            <Link to="/signup" className="hover:text-[#714B67] transition-colors">Club Owner Sign Up</Link>
            <Link to="/login" className="hover:text-[#714B67] transition-colors">Staff Login</Link>
          </div>

          <div className="text-gray-400 text-[11px]">
            © {new Date().getFullYear()} Skyline Sports Club. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
