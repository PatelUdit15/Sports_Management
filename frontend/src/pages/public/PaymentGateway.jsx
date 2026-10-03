import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  ChevronLeft,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Clock,
  Download,
  Share2,
  User,
  Zap,
} from 'lucide-react';
import publicService from '../../services/publicService';

export default function PaymentGateway() {
  const navigate = useNavigate();

  // Load selected membership & member from localStorage
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'NETBANKING'
  const [enteredAmount, setEnteredAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');

  // Processing & Confirmation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedData, setConfirmedData] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    // 1. Get selected membership
    const storedMembership = localStorage.getItem('selectedMembership');
    if (storedMembership) {
      try {
        const parsed = JSON.parse(storedMembership);
        setSelectedMembership(parsed);
      } catch (e) {
        console.error('Error parsing selected membership', e);
      }
    } else {
      // Default to Skyline Sports Club Gold Plan
      const defaultSelection = {
        clubId: 'CLUB-SKYLINE-FLAGSHIP',
        clubName: 'Skyline Sports Club - Flagship Arena',
        clubSport: 'Multi-Sport (Tennis, Badminton, Squash, Swimming)',
        clubAddress: 'Plot 42, Olympic Boulevard, Sports City',
        tier: 'GOLD',
        tierName: 'Gold All-Access VIP',
        price: 4999,
        period: 'month',
        features: [
          'Unlimited Court Bookings (All Sports & Times)',
          'Heated Olympic Pool & State-of-the-Art Gym',
          'Priority Peak Hour Reservation (7 days ahead)',
          '25% Discount at Sports Cafe & Pro Shop',
        ],
      };
      setSelectedMembership(defaultSelection);
    }

    // 2. Get member info
    const storedMember = localStorage.getItem('currentMember');
    if (storedMember) {
      try {
        const parsedM = JSON.parse(storedMember);
        setCurrentMember(parsedM);
        if (parsedM.fullName) {
          setCardName(parsedM.fullName);
        }
      } catch (e) {
        console.error('Error parsing member', e);
      }
    }
  }, []);

  const planPrice = selectedMembership?.price || 4999;
  const numericEntered = parseFloat(enteredAmount);
  // Highlight condition: entered amount matches plan price
  const isAmountMatched = !isNaN(numericEntered) && Math.abs(numericEntered - planPrice) < 0.01;

  const handleFillExactAmount = () => {
    setEnteredAmount(planPrice.toString());
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAmountMatched) {
      setError(`Please enter the exact payment amount of ₹${planPrice.toLocaleString()} according to the plan to confirm.`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: currentMember?.email || 'member@skylinesports.com',
        fullName: currentMember?.fullName || cardName || 'Valued Member',
        phone: currentMember?.phone || '',
        age: currentMember?.age || null,
        birthday: currentMember?.birthday || null,
        gender: currentMember?.gender || null,
        clubId: selectedMembership.clubId,
        tier: selectedMembership.tier,
        amount: planPrice,
        paymentMethod,
        transactionRef: `TXN-SKY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      const res = await publicService.confirmPayment(payload);

      if (res.success && res.data) {
        setConfirmedData(res.data);
        // Save confirmed pass to storage
        localStorage.setItem('activeMemberPass', JSON.stringify(res.data));
      } else {
        setError(res.message || 'Payment processing failed');
      }
    } catch (err) {
      setError(err?.message || 'Payment error occurred. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const copyMemberId = () => {
    if (confirmedData?.memberId) {
      navigator.clipboard.writeText(confirmedData.memberId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0C20] text-gray-100 flex flex-col justify-between selection:bg-[#8B5CF6] selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-5 border-b border-white/10 backdrop-blur-md bg-[#0F0C20]/70">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] p-0.5 shadow-md shadow-purple-500/30">
              <div className="w-full h-full bg-[#0F0C20] rounded-[10px] flex items-center justify-center">
                <Trophy size={18} className="text-[#A855F7]" />
              </div>
            </div>
            <div>
              <div className="text-[16px] font-bold text-white tracking-tight">Skyline Sports Club</div>
              <div className="text-[10px] text-gray-400 font-medium">Secure Payment Gateway</div>
            </div>
          </Link>

          {!confirmedData && (
            <Link
              to="/user/clubs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              <ChevronLeft size={16} /> Change Club or Plan
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        {/* If payment already confirmed, show the Generated Member ID & Digital Pass */}
        {confirmedData ? (
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#1E1838] via-[#141028] to-[#0F0C20] border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/20 text-center animate-fade-in">
            {/* Success icon */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto mb-6 shadow-xl shadow-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-white" />
            </div>

            <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
              Payment Confirmed &amp; Membership Activated
            </span>

            <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
              Welcome to {confirmedData.club.name}!
            </h1>

            <p className="text-sm text-gray-300 mt-2 max-w-lg mx-auto">
              Your transaction has been processed and your official membership ID has been generated in the sports club database.
            </p>

            {/* Generated Member ID Highlight Box */}
            <div className="my-8 p-6 rounded-2xl bg-white/[0.04] border border-white/15 max-w-md mx-auto shadow-inner text-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Official Generated Member ID
              </span>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span
                  id="generated-member-id"
                  className="text-2xl sm:text-3xl font-black font-mono tracking-wider bg-gradient-to-r from-amber-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
                >
                  {confirmedData.memberId}
                </span>
                <button
                  type="button"
                  id="copy-member-id-btn"
                  onClick={copyMemberId}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                  title="Copy Member ID"
                >
                  {copiedId ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                </button>
              </div>
              {copiedId && (
                <span className="text-[11px] font-bold text-emerald-400 mt-1 block">
                  ✓ Member ID copied to clipboard!
                </span>
              )}
            </div>

            {/* Digital Membership Pass Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-900/60 via-indigo-950/80 to-[#120E26] border border-purple-500/40 max-w-lg mx-auto text-left shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-2xl rounded-full" />
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-black text-black text-xs">
                    S
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">{confirmedData.club.name}</div>
                    <div className="text-[10px] text-gray-400">{confirmedData.club.sport}</div>
                  </div>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {confirmedData.tier} TIER
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 my-5 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Member Name</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{confirmedData.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Membership Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-xs mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE MEMBER
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Valid From</span>
                  <span className="font-semibold text-gray-200 mt-0.5 block">
                    {new Date(confirmedData.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Valid Until</span>
                  <span className="font-semibold text-gray-200 mt-0.5 block">
                    {new Date(confirmedData.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Barcode & Security stamp */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-6 flex items-center gap-1">
                    {[16, 24, 18, 30, 14, 28, 20, 32, 18, 26, 12, 28, 22, 16, 30, 24, 18].map((h, i) => (
                      <div key={i} className="w-1 bg-white/70 rounded-full" style={{ height: `${h}px` }} />
                    ))}
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono tracking-widest block">
                    TXN: {confirmedData.payment.transactionRef}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-purple-300 font-bold block">Verified Member</span>
                  <span className="text-[9px] text-gray-400 block">Amount: ₹{confirmedData.amountPaid.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-all text-center"
              >
                Back to Skyline Home
              </Link>
              <Link
                to="/user/clubs"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#EC4899] shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all text-center"
              >
                Explore Other Clubs
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Entry Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Plan Summary */}
            <div className="lg:col-span-5 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent border border-white/15 shadow-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-bold text-purple-300 mb-3">
                <Sparkles size={12} className="text-amber-400" />
                <span>Selected Membership</span>
              </div>

              <h2 className="text-2xl font-black text-white">{selectedMembership?.tierName || 'Gold All-Access'}</h2>
              <div className="text-xs text-purple-300 font-semibold mt-1">
                At {selectedMembership?.clubName || 'Skyline Sports Club'}
              </div>

              <div className="my-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-400">Plan Membership Fee:</span>
                  <span className="text-3xl font-black text-white">₹{planPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-gray-400 mt-2">
                  <span>Duration:</span>
                  <span className="text-gray-200 font-medium">30 Days Active Access</span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-gray-400 mt-1">
                  <span>Club Location:</span>
                  <span className="text-gray-200 font-medium truncate max-w-[180px]">
                    {selectedMembership?.clubAddress || 'Sports City'}
                  </span>
                </div>
              </div>

              {/* Inclusions */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Tier Privileges Included:
                </div>
                {selectedMembership?.features?.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{f}</span>
                  </div>
                ))}
              </div>

              {/* Prompt instruction badge */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
                💡 <strong>Payment Step:</strong> Enter the payment amount (<strong>₹{planPrice.toLocaleString()}</strong>) in the payment box to highlight and enable the Confirm button.
              </div>
            </div>

            {/* Right Column: Payment Gateway Inputs */}
            <div className="lg:col-span-7 rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent border border-white/15 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                <div>
                  <h3 className="text-xl font-black text-white">Payment Gateway</h3>
                  <p className="text-xs text-gray-400">Enter payment according to selected plan</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <ShieldCheck size={16} />
                  <span>256-bit Encrypted</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleConfirmPayment} className="space-y-5">
                {/* 1. REQUIRED: Payment Amount Input Field */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase tracking-wider text-white">
                      Enter Payment Amount (₹) *
                    </label>
                    <button
                      type="button"
                      id="fill-exact-amount-btn"
                      onClick={handleFillExactAmount}
                      className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline"
                    >
                      Fill Exact Plan Amount (₹{planPrice.toLocaleString()})
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      id="payment-amount-input"
                      value={enteredAmount}
                      onChange={(e) => setEnteredAmount(e.target.value)}
                      placeholder={`Enter ${planPrice}`}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border text-white text-lg font-bold placeholder-gray-500 focus:outline-none transition-all ${
                        isAmountMatched
                          ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-500/5'
                          : 'border-white/15 focus:border-purple-500'
                      }`}
                    />
                  </div>

                  {/* Verification Feedback */}
                  <div className="mt-2 text-xs">
                    {isAmountMatched ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        Amount Matched Plan Fee! Ready to confirm.
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        Required plan fee: <strong>₹{planPrice.toLocaleString()}</strong>. (Type {planPrice} to highlight confirm button).
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'CARD'
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <CreditCard size={18} />
                      <span>Credit/Debit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'UPI'
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <QrCode size={18} />
                      <span>UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'NETBANKING'
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Building2 size={18} />
                      <span>Net Banking</span>
                    </button>
                  </div>
                </div>

                {/* 3. Payment Details Inputs */}
                {paymentMethod === 'CARD' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength="4"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                          placeholder="888"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                        placeholder="Johnathan Vance"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. member@okhdfcbank"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                    <div className="flex gap-2 mt-2">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setUpiId(`user@${app.toLowerCase().replace(' ', '')}`)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10"
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                      Select Bank
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-[#1A1633] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {/* 4. DYNAMIC CONFIRM BUTTON:
                   "after payment is written give a button that says confirm.
                   When user enters the payment acc to the given plan highlight that confirm button." */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !isAmountMatched}
                    id="confirm-payment-btn"
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                      isAmountMatched
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-black shadow-2xl shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] ring-4 ring-emerald-400/30 animate-pulse'
                        : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/10'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Processing &amp; Generating Member ID...</span>
                      </>
                    ) : isAmountMatched ? (
                      <>
                        <CheckCircle2 size={18} className="text-black" />
                        <span>Confirm Payment (₹{planPrice.toLocaleString()})</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Confirm (Enter ₹{planPrice.toLocaleString()} to Confirm)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-white/10 text-center text-xs text-gray-500">
        Skyline Sports Club • Multi-Tenant Sports SaaS Architecture
      </footer>
    </div>
  );
}
