import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  MapPin,
  Phone,
  Globe,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Search,
  Filter,
  Star,
  Zap,
  User,
  ShieldCheck,
} from 'lucide-react';
import publicService from '../../services/publicService';

export default function ClubsDirectory() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Load current member from localStorage
  const currentMember = JSON.parse(localStorage.getItem('currentMember') || '{}');

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await publicService.getClubs();
      if (res.success && res.data) {
        setClubs(res.data);
      } else {
        setClubs([]);
      }
    } catch (err) {
      console.error('Failed to fetch clubs:', err);
      setError('Unable to load sports clubs from network. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMembership = (club, tierObj) => {
    const selection = {
      clubId: club.clubId,
      clubName: club.name,
      clubSport: club.sport,
      clubAddress: club.address,
      clubEmail: club.email,
      tier: tierObj.tier,
      tierName: tierObj.name,
      price: tierObj.price,
      period: tierObj.period,
      features: tierObj.features,
      selectedAt: new Date().toISOString(),
    };

    localStorage.setItem('selectedMembership', JSON.stringify(selection));
    // Immediately navigate to payment gateway
    navigate('/payment');
  };

  const filteredClubs = clubs.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.sport && c.sport.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilter === 'FLAGSHIP') return c.isFlagship;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0F0C20] text-gray-100 flex flex-col justify-between selection:bg-[#8B5CF6] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0F0C20]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] p-0.5 shadow-md shadow-purple-500/30">
              <div className="w-full h-full bg-[#0F0C20] rounded-[10px] flex items-center justify-center">
                <Trophy size={18} className="text-[#A855F7]" />
              </div>
            </div>
            <div>
              <div className="text-[16px] font-bold text-white tracking-tight">Skyline Sports Club</div>
              <div className="text-[10px] text-gray-400 font-medium">Connected Clubs &amp; Memberships</div>
            </div>
          </Link>

          {/* Member Profile pill */}
          <div className="flex items-center gap-3">
            {currentMember?.fullName && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[11px] font-bold">
                  {currentMember.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-300 font-medium">Hi, {currentMember.fullName}</span>
              </div>
            )}
            <Link
              to="/get-started"
              className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              Portal Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Banner */}
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-purple-900/40 via-purple-600/20 to-pink-900/30 border border-purple-500/30 shadow-2xl relative overflow-hidden mb-12">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-purple-200 mb-4">
              <Sparkles size={14} className="text-amber-400" />
              <span>Step 2: Choose Sports Club &amp; Membership Plan</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {currentMember?.fullName ? `Welcome, ${currentMember.fullName}!` : 'Sports Club Network'} <br />
              Select Your Club &amp; Membership
            </h1>

            <p className="text-sm sm:text-base text-gray-300 mt-3 leading-relaxed">
              Explore all sports clubs connected to our SaaS platform. Choose between <strong>GOLD</strong>, <strong>SILVER</strong>, and <strong>BRONZE</strong> plans for your preferred sports club to proceed directly to the payment gateway.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search club name, sport, city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              All Connected Clubs ({clubs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('FLAGSHIP')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'FLAGSHIP'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              ★ Skyline Flagship
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Loading sports clubs and membership plans...</p>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-md mx-auto my-12">
            <p className="text-sm text-red-300 mb-3">{error}</p>
            <button
              onClick={fetchClubs}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500"
            >
              Retry Loading Clubs
            </button>
          </div>
        )}

        {/* Sports Clubs List */}
        {!loading && !error && (
          <div className="space-y-16">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent border ${
                  club.isFlagship ? 'border-purple-500/50 shadow-2xl shadow-purple-900/20' : 'border-white/10'
                }`}
              >
                {/* Club Header Info */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl sm:text-3xl font-black text-white">{club.name}</h2>
                      {club.isFlagship && (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-sm">
                          ★ Flagship Arena
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                        {club.sport || 'Multi-Sport'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-purple-400" />
                        <span>{club.address}</span>
                      </div>
                      {club.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} className="text-purple-400" />
                          <span>{club.phone}</span>
                        </div>
                      )}
                      {club.website && (
                        <div className="flex items-center gap-1.5">
                          <Globe size={14} className="text-purple-400" />
                          <a href={club.website} target="_blank" rel="noreferrer" className="hover:underline text-gray-300">
                            {club.website.replace('https://', '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    <span className="font-bold text-white">Separate Memberships:</span> Gold, Silver &amp; Bronze
                  </div>
                </div>

                {/* Separate Membership Tiers for this Club: GOLD, SILVER, BRONZE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-stretch">
                  {club.tiers.map((tier) => {
                    const isGold = tier.tier === 'GOLD';
                    const isSilver = tier.tier === 'SILVER';
                    const isBronze = tier.tier === 'BRONZE';

                    return (
                      <div
                        key={tier.tier}
                        className={`rounded-2xl p-6 border flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                          isGold
                            ? 'border-amber-400/60 bg-gradient-to-b from-amber-500/10 via-purple-500/5 to-transparent ring-1 ring-amber-400/30'
                            : isSilver
                            ? 'border-slate-400/40 bg-slate-500/5'
                            : 'border-amber-700/40 bg-amber-700/5'
                        }`}
                      >
                        <div>
                          {/* Badge */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                isGold
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  : isSilver
                                  ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30'
                                  : 'bg-amber-700/20 text-amber-400 border border-amber-700/30'
                              }`}
                            >
                              {tier.tier} MEMBERSHIP
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">{tier.badge}</span>
                          </div>

                          <h3 className="text-xl font-black text-white mt-3">{tier.name}</h3>

                          {/* Price */}
                          <div className="my-4 pb-4 border-b border-white/10">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-white">₹{tier.price.toLocaleString()}</span>
                              <span className="text-xs text-gray-400">/{tier.period}</span>
                            </div>
                          </div>

                          {/* Perks */}
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                              Included Privileges:
                            </div>
                            {tier.features.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-2 text-xs text-gray-300">
                                <CheckCircle2
                                  size={14}
                                  className={`flex-shrink-0 mt-0.5 ${
                                    isGold ? 'text-amber-400' : isSilver ? 'text-blue-400' : 'text-emerald-400'
                                  }`}
                                />
                                <span className="leading-snug">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Select Membership Button -> Directs to Payment Gateway */}
                        <div className="mt-6 pt-4 border-t border-white/10">
                          <button
                            type="button"
                            id={`select-${club.id}-${tier.tier.toLowerCase()}-btn`}
                            onClick={() => handleSelectMembership(club, tier)}
                            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                              isGold
                                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-black hover:scale-[1.02]'
                                : isSilver
                                ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-black font-black hover:scale-[1.02]'
                                : 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white hover:scale-[1.02]'
                            }`}
                          >
                            <span>Select {tier.tier} &amp; Pay</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-gray-500">
        Skyline Sports Club Network • Live Multi-Club Membership Management
      </footer>
    </div>
  );
}
