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
        // Save confirmed pass and tokens to storage
        localStorage.setItem('activeMemberPass', JSON.stringify(res.data));
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('member_token', res.data.token);
        }
        if (res.data.member) {
          localStorage.setItem('member_data', JSON.stringify(res.data.member));
        }
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
    <div className="min-h-screen bg-[#F5F6FA] text-gray-900 flex flex-col justify-between selection:bg-[#714B67] selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-[#E5E7EB] bg-white shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#714B67] flex items-center justify-center shadow-xs">
              <Trophy size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-gray-900 tracking-tight">Skyline Sports Club</div>
              <div className="text-[10px] text-gray-500 font-medium">Secure Payment Gateway</div>
            </div>
          </Link>

          {!confirmedData && (
            <Link
              to="/user/clubs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#714B67] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
            >
              <ChevronLeft size={16} /> Change Club or Plan
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        {/* If payment already confirmed, show the Generated Member ID & Digital Pass */}
        {confirmedData ? (
          <div className="rounded-2xl p-8 sm:p-10 bg-white border border-[#E5E7EB] shadow-xs text-center animate-fade-in">
            {/* Success icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              Payment Confirmed &amp; Membership Activated
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Welcome to {confirmedData.club.name}!
            </h1>

            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-lg mx-auto">
              Your transaction has been processed and your official membership ID has been generated in the sports club database.
            </p>

            {/* Generated Member ID Highlight Box */}
            <div className="my-6 p-5 rounded-xl bg-purple-50 border border-purple-200 max-w-md mx-auto text-center">
              <span className="text-[11px] font-bold text-[#714B67] uppercase tracking-widest block">
                Official Generated Member ID
              </span>
              <div className="flex items-center justify-center gap-3 mt-1.5">
                <span
                  id="generated-member-id"
                  className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-[#714B67]"
                >
                  {confirmedData.memberId}
                </span>
                <button
                  type="button"
                  id="copy-member-id-btn"
                  onClick={copyMemberId}
                  className="p-1.5 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  title="Copy Member ID"
                >
                  {copiedId ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
              {copiedId && (
                <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                  ✓ Member ID copied to clipboard!
                </span>
              )}
            </div>

            {/* Digital Membership Pass Card */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white max-w-lg mx-auto text-left shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-bold text-slate-900 text-xs">
                    S
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{confirmedData.club.name}</div>
                    <div className="text-[10px] text-gray-300">{confirmedData.club.sport}</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {confirmedData.tier} TIER
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 my-4 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Member Name</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{confirmedData.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Status</span>
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
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-mono tracking-widest block">
                    TXN: {confirmedData.payment.transactionRef}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 block">Amount: ₹{confirmedData.amountPaid.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Link
                to="/member/dashboard"
                id="goto-member-dashboard-btn"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white bg-[#714B67] hover:bg-[#57344f] shadow-xs hover:shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
              >
                <span>Go to Member Dashboard</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/user/clubs"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 transition-all text-center"
              >
                Explore Other Clubs
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Entry Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Plan Summary */}
            <div className="lg:col-span-5 rounded-2xl p-6 sm:p-8 bg-white border border-[#E5E7EB] shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-[#714B67] mb-3">
                <Sparkles size={12} className="text-amber-500" />
                <span>Selected Membership</span>
              </div>

              <h2 className="text-xl font-bold text-gray-900">{selectedMembership?.tierName || 'Gold All-Access'}</h2>
              <div className="text-xs text-[#714B67] font-semibold mt-1">
                At {selectedMembership?.clubName || 'Skyline Sports Club'}
              </div>

              <div className="my-5 pb-5 border-b border-gray-200">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-500">Plan Membership Fee:</span>
                  <span className="text-3xl font-extrabold text-gray-900">₹{planPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-gray-500 mt-2">
                  <span>Duration:</span>
                  <span className="text-gray-800 font-medium">30 Days Active Access</span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-gray-500 mt-1">
                  <span>Club Location:</span>
                  <span className="text-gray-800 font-medium truncate max-w-[180px]">
                    {selectedMembership?.clubAddress || 'Sports City'}
                  </span>
                </div>
              </div>

              {/* Inclusions */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Tier Privileges Included:
                </div>
                {selectedMembership?.features?.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{f}</span>
                  </div>
                ))}
              </div>

              {/* Prompt instruction badge */}
              <div className="mt-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                💡 <strong>Payment Step:</strong> Enter the payment amount (<strong>₹{planPrice.toLocaleString()}</strong>) in the payment box to highlight and enable the Confirm button.
              </div>
            </div>

            {/* Right Column: Payment Gateway Inputs */}
            <div className="lg:col-span-7 rounded-2xl p-6 sm:p-8 bg-white border border-[#E5E7EB] shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Payment Gateway</h3>
                  <p className="text-xs text-gray-500">Enter payment according to selected plan</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <ShieldCheck size={16} />
                  <span>256-bit Encrypted</span>
                </div>
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleConfirmPayment} className="space-y-4">
                {/* 1. REQUIRED: Payment Amount Input Field */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Enter Payment Amount (₹) *
                    </label>
                    <button
                      type="button"
                      id="fill-exact-amount-btn"
                      onClick={handleFillExactAmount}
                      className="text-[11px] font-bold text-[#714B67] hover:underline cursor-pointer"
                    >
                      Fill Exact Plan Amount (₹{planPrice.toLocaleString()})
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      id="payment-amount-input"
                      value={enteredAmount}
                      onChange={(e) => setEnteredAmount(e.target.value)}
                      placeholder={`Enter ${planPrice}`}
                      className={`w-full pl-8 pr-4 py-2.5 rounded-lg bg-white border text-gray-900 text-base font-bold placeholder-gray-400 focus:outline-none transition-all ${
                        isAmountMatched
                          ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/20'
                          : 'border-gray-300 focus:border-[#714B67]'
                      }`}
                    />
                  </div>

                  {/* Verification Feedback */}
                  <div className="mt-2 text-xs">
                    {isAmountMatched ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        Amount Matched Plan Fee! Ready to confirm.
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Required plan fee: <strong>₹{planPrice.toLocaleString()}</strong>. (Type {planPrice} to highlight confirm button).
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'CARD'
                          ? 'border-[#714B67] bg-purple-50 text-[#714B67]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard size={16} />
                      <span>Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'UPI'
                          ? 'border-[#714B67] bg-purple-50 text-[#714B67]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <QrCode size={16} />
                      <span>UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'NETBANKING'
                          ? 'border-[#714B67] bg-purple-50 text-[#714B67]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Building2 size={16} />
                      <span>Net Banking</span>
                    </button>
                  </div>
                </div>

                {/* 3. Payment Details Inputs */}
                {paymentMethod === 'CARD' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs font-mono focus:outline-none focus:border-[#714B67]"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs font-mono focus:outline-none focus:border-[#714B67]"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength="4"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs font-mono focus:outline-none focus:border-[#714B67]"
                          placeholder="888"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs focus:outline-none focus:border-[#714B67]"
                        placeholder="Johnathan Vance"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. member@okhdfcbank"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs focus:outline-none focus:border-[#714B67]"
                    />
                    <div className="flex gap-2 mt-2">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setUpiId(`user@${app.toLowerCase().replace(' ', '')}`)}
                          className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 text-[10px] text-gray-700 cursor-pointer"
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Select Bank
                    </label>
                    <select className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs focus:outline-none focus:border-[#714B67]">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {/* 4. DYNAMIC CONFIRM BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !isAmountMatched}
                    id="confirm-payment-btn"
                    className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                      isAmountMatched
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md ring-4 ring-emerald-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing &amp; Generating Member ID...</span>
                      </>
                    ) : isAmountMatched ? (
                      <>
                        <CheckCircle2 size={18} className="text-white" />
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
      <footer className="py-4 border-t border-[#E5E7EB] bg-white text-center text-xs text-gray-500">
        Skyline Sports Club • Multi-Tenant Sports SaaS Architecture
      </footer>
    </div>
  );
}
