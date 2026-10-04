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

  // Load current member from localStorage safely
  const currentMember = (() => {
    try {
      const item = localStorage.getItem('currentMember');
      return item && item !== 'undefined' ? JSON.parse(item) : {};
    } catch {
      return {};
    }
  })();

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
    <div className="min-h-screen bg-[#F5F6FA] text-gray-900 flex flex-col justify-between selection:bg-[#6B3FA0] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white border-b border-[#E5E7EB] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B3FA0] flex items-center justify-center shadow-xs">
              <Trophy size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-gray-900 tracking-tight">Skyline Sports Club</div>
              <div className="text-[10px] text-gray-500 font-medium">Connected Clubs &amp; Memberships</div>
            </div>
          </Link>

          {/* Member Profile pill */}
          <div className="flex items-center gap-3">
            {currentMember?.fullName && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#6B3FA0] flex items-center justify-center text-white text-[11px] font-bold">
                  {currentMember.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700 font-medium">Hi, {currentMember.fullName}</span>
              </div>
            )}
            <Link
              to="/get-started"
              className="text-xs font-semibold text-gray-600 hover:text-[#6B3FA0] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
            >
              Portal Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Banner */}
        <div className="rounded-2xl p-6 sm:p-8 bg-white border border-[#E5E7EB] shadow-xs relative overflow-hidden mb-8">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold text-[#6B3FA0] mb-3">
              <Sparkles size={14} className="text-amber-500" />
              <span>Step 2: Choose Sports Club &amp; Membership Plan</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {currentMember?.fullName ? `Welcome, ${currentMember.fullName}!` : 'Sports Club Network'} <br />
              Select Your Club &amp; Membership
            </h1>

            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Explore all sports clubs connected to our SaaS platform. Choose between <strong>GOLD</strong>, <strong>SILVER</strong>, and <strong>BRONZE</strong> plans for your preferred sports club to proceed directly to the payment gateway.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search club name, sport, city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:border-[#6B3FA0] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-[#6B3FA0] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All Connected Clubs ({clubs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('FLAGSHIP')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'FLAGSHIP'
                  ? 'bg-[#6B3FA0] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              ★ Skyline Flagship
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-[#6B3FA0] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Loading sports clubs and membership plans...</p>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-center max-w-md mx-auto my-10">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button
              onClick={fetchClubs}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
            >
              Retry Loading Clubs
            </button>
          </div>
        )}

        {/* Sports Clubs List */}
        {!loading && !error && (
          <div className="space-y-10">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="rounded-2xl p-6 sm:p-8 bg-white border border-[#E5E7EB] shadow-xs"
              >
                {/* Club Header Info */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold text-gray-900">{club.name}</h2>
                      {club.isFlagship && (
                        <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                          ★ Flagship Arena
                        </span>
                      )}
                      <span className="px-3 py-0.5 rounded-full bg-purple-50 text-[#6B3FA0] border border-purple-200 text-xs font-semibold">
                        {club.sport || 'Multi-Sport'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#6B3FA0]" />
                        <span>{club.address}</span>
                      </div>
                      {club.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} className="text-[#6B3FA0]" />
                          <span>{club.phone}</span>
                        </div>
                      )}
                      {club.website && (
                        <div className="flex items-center gap-1.5">
                          <Globe size={14} className="text-[#6B3FA0]" />
                          <a href={club.website} target="_blank" rel="noreferrer" className="hover:underline text-gray-600">
                            {club.website.replace('https://', '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <span className="font-bold text-gray-800">Available Plans:</span> Gold, Silver &amp; Bronze
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
                        className={`rounded-xl p-6 border flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                          isGold
                            ? 'border-2 border-[#6B3FA0] bg-purple-50/20'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div>
                          {/* Badge */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                isGold
                                  ? 'bg-purple-100 text-[#6B3FA0] border border-purple-200'
                                  : isSilver
                                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {tier.tier} MEMBERSHIP
                            </span>
                            <span className="text-[10px] text-gray-500 font-semibold">{tier.badge}</span>
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 mt-3">{tier.name}</h3>

                          {/* Price */}
                          <div className="my-4 pb-4 border-b border-gray-100">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-extrabold text-gray-900">₹{tier.price.toLocaleString()}</span>
                              <span className="text-xs text-gray-500">/{tier.period}</span>
                            </div>
                          </div>

                          {/* Perks */}
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                              Included Privileges:
                            </div>
                            {tier.features.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-2 text-xs text-gray-600">
                                <CheckCircle2
                                  size={14}
                                  className="text-emerald-600 flex-shrink-0 mt-0.5"
                                />
                                <span className="leading-snug">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Select Membership Button -> Directs to Payment Gateway */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <button
                            type="button"
                            id={`select-${club.id}-${tier.tier.toLowerCase()}-btn`}
                            onClick={() => handleSelectMembership(club, tier)}
                            className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              isGold
                                ? 'bg-[#6B3FA0] hover:bg-[#5a348a] text-white shadow-xs'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
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
      <footer className="py-4 border-t border-[#E5E7EB] bg-white text-center text-xs text-gray-500">
        Skyline Sports Club Network • Live Multi-Club Membership Management
      </footer>
    </div>
  );
}
