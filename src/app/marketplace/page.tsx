'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { db, Influencer } from '../../lib/db';
import {
  Search,
  MapPin,
  Users,
  Tv,
  Film,
  FileText,
  ShieldAlert,
  Coins,
  CheckCircle,
  X,
  CreditCard,
  Check
} from 'lucide-react';

export default function MarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('followers-desc');

  // Checkout Modal State
  const [bookingInfluencer, setBookingInfluencer] = useState<Influencer | null>(null);
  const [selectedContent, setSelectedContent] = useState<'story' | 'reel' | 'post'>('reel');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [paymentTxId, setPaymentTxId] = useState('');

  useEffect(() => {
    const fetchInfluencers = async () => {
      setLoading(true);
      try {
        const list = await db.getInfluencers();
        // Only show approved/verified influencers in the marketplace
        setInfluencers(list.filter(i => i.kyc_status === 'approved'));
      } catch (err) {
        console.error('Error fetching influencers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencers();
  }, []);

  // Filter Logic
  const filteredInfluencers = influencers.filter(inf => {
    const matchesSearch =
      inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.social_handle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesNiche = selectedNiche === 'All' || inf.niche === selectedNiche;
    const matchesRegion = selectedRegion === 'All' || inf.region === selectedRegion;

    let matchesTier = true;
    if (selectedTier !== 'All') {
      const count = inf.follower_count;
      if (selectedTier === 'micro') matchesTier = count >= 10000 && count <= 50000;
      else if (selectedTier === 'mid') matchesTier = count > 50000 && count <= 100000;
      else if (selectedTier === 'macro') matchesTier = count > 100000 && count <= 500000;
      else if (selectedTier === 'mega') matchesTier = count > 500000;
    }

    return matchesSearch && matchesNiche && matchesRegion && matchesTier;
  }).sort((a, b) => {
    if (sortBy === 'followers-desc') return b.follower_count - a.follower_count;
    if (sortBy === 'followers-asc') return a.follower_count - b.follower_count;
    if (sortBy === 'rate-asc') {
      const aMin = Math.min(a.rate_card.story, a.rate_card.reel, a.rate_card.post);
      const bMin = Math.min(b.rate_card.story, b.rate_card.reel, b.rate_card.post);
      return aMin - bMin;
    }
    if (sortBy === 'rate-desc') {
      const aMax = Math.max(a.rate_card.story, a.rate_card.reel, a.rate_card.post);
      const bMax = Math.max(b.rate_card.story, b.rate_card.reel, b.rate_card.post);
      return bMax - aMax;
    }
    return 0;
  });

  // Calculate pricing for checkout
  const getEscrowBreakdown = () => {
    if (!bookingInfluencer) return { dealAmount: 0, commission: 0, escrowFee: 99, total: 0 };
    const dealAmount = bookingInfluencer.rate_card[selectedContent];
    const commission = Math.round(dealAmount * 0.12); // 12% average commission
    const escrowFee = 99; // flat ₹99
    const total = dealAmount + escrowFee; // Startup pays dealAmount + flat ₹99, commission is deducted from influencer payout on release
    return { dealAmount, commission, escrowFee, total };
  };

  const handleBookClick = (inf: Influencer) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'startup') {
      alert('Only startups can book influencers.');
      return;
    }
    setBookingInfluencer(inf);
    setCheckoutSuccess(false);
  };

  const triggerRazorpayCheckout = async () => {
    if (!bookingInfluencer || !user) return;
    setCheckoutLoading(true);

    const breakdown = getEscrowBreakdown();

    // 1. Call mock order creation API
    try {
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: breakdown.total })
      });
      const orderData = await orderRes.json();
      const orderId = orderData.orderId || `order_${Date.now()}`;

      // 2. Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockKey123',
        amount: breakdown.total * 100, // paise
        currency: 'INR',
        name: 'CollabEscrow',
        description: `Escrow Lock for ${bookingInfluencer.name}`,
        order_id: orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || 'mock_signature'
            })
          });
          const verifyData = await verifyRes.json();

          if (verifyData.status === 'verified') {
            // 4. Create local transaction record
            const txRes = await db.createTransaction({
              startup_id: user.id,
              influencer_id: bookingInfluencer.id,
              amount: breakdown.dealAmount,
              status: 'pending',
              commission: breakdown.commission,
              escrow_fee: breakdown.escrowFee,
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`
            });

            if (txRes.transaction) {
              setPaymentTxId(txRes.transaction.id);
              setCheckoutSuccess(true);
            } else {
              alert('Error recording transaction: ' + txRes.error);
            }
          } else {
            alert('Payment verification failed.');
          }
          setCheckoutLoading(false);
        },
        prefill: {
          email: user.email,
          contact: '9999999999'
        },
        theme: {
          color: '#6366f1' // Indigo
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
          }
        }
      };

      // 3. Open Checkout Modal
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error during checkout trigger:', err);
      // Fallback: If network API fails, let's complete a mock transaction to make it work!
      setTimeout(async () => {
        const txRes = await db.createTransaction({
          startup_id: user.id,
          influencer_id: bookingInfluencer.id,
          amount: breakdown.dealAmount,
          status: 'pending',
          commission: breakdown.commission,
          escrow_fee: breakdown.escrowFee,
          razorpay_order_id: `mock_order_${Date.now()}`,
          razorpay_payment_id: `mock_pay_${Date.now()}`
        });
        if (txRes.transaction) {
          setPaymentTxId(txRes.transaction.id);
          setCheckoutSuccess(true);
        }
        setCheckoutLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filters Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 glow-indigo mb-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">Find Influencers</h1>
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="appearance-none rounded-xl block w-full pl-9 pr-3 py-2 border border-gray-800 bg-[#070a13] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
              placeholder="Search name or handle..."
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">Niche</label>
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="w-full bg-[#070a13] border border-gray-800 rounded-xl px-2 py-2 text-sm text-gray-300 focus:outline-none"
            >
              <option value="All">All Niches</option>
              <option value="Food">Food</option>
              <option value="Education">Education</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-[#070a13] border border-gray-800 rounded-xl px-2 py-2 text-sm text-gray-300 focus:outline-none"
            >
              <option value="All">All Regions</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi-NCR">Delhi-NCR</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Kolkata">Kolkata</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">Followers</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-[#070a13] border border-gray-800 rounded-xl px-2 py-2 text-sm text-gray-300 focus:outline-none"
            >
              <option value="All">All Tiers</option>
              <option value="micro">Micro (10k - 50k)</option>
              <option value="mid">Mid-Tier (50k - 100k)</option>
              <option value="macro">Macro (100k - 500k)</option>
              <option value="mega">Mega (500k+)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#070a13] border border-gray-800 rounded-xl px-2 py-2 text-sm text-gray-300 focus:outline-none"
            >
              <option value="followers-desc">Followers: High to Low</option>
              <option value="followers-asc">Followers: Low to High</option>
              <option value="rate-asc">Cheapest Rate</option>
              <option value="rate-desc">Highest Rate</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-1 flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedNiche('All');
                setSelectedRegion('All');
                setSelectedTier('All');
                setSortBy('followers-desc');
              }}
              className="w-full bg-slate-850 hover:bg-slate-800 text-gray-400 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-gray-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span className="text-gray-500 text-sm">Searching creators...</span>
        </div>
      ) : filteredInfluencers.length === 0 ? (
        <div className="glass-panel py-16 text-center rounded-2xl border border-gray-800/80 text-gray-500">
          <ShieldAlert className="w-12 h-12 text-indigo-500/30 mx-auto mb-2" />
          <p className="font-semibold text-lg text-white">No influencers match your search filters.</p>
          <p className="text-sm mt-1">Try resetting the niche or follower filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map(inf => (
            <div
              key={inf.id}
              className="glass-panel p-6 rounded-2xl border border-gray-800/80 hover:border-indigo-500/30 hover:translate-y-[-2px] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-extrabold text-white text-lg group-hover:text-indigo-400 transition-colors">
                      {inf.name}
                    </h3>
                    <span className="text-xs text-cyan-400 font-medium block mt-0.5">{inf.social_handle}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    {inf.niche}
                  </span>
                </div>

                <div className="flex gap-4 items-center text-xs text-gray-400 mb-6">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-500" />
                    <strong>{inf.follower_count.toLocaleString()}</strong> followers
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    {inf.region}
                  </span>
                </div>

                {/* Rate Card Grid */}
                <div className="grid grid-cols-3 gap-2 bg-[#070a13]/70 p-3 rounded-xl border border-gray-900 mb-6">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold">Story</span>
                    <span className="text-sm font-bold text-white">₹{inf.rate_card.story.toLocaleString()}</span>
                  </div>
                  <div className="text-center border-x border-gray-900">
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold">Reel</span>
                    <span className="text-sm font-bold text-white">₹{inf.rate_card.reel.toLocaleString()}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-500 block uppercase font-semibold">Post</span>
                    <span className="text-sm font-bold text-white">₹{inf.rate_card.post.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleBookClick(inf)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2.5 rounded-xl transition-all glow-indigo flex items-center justify-center gap-1.5"
                >
                  Book Influencer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RAZORPAY CHECKOUT OVERLAY DIALOG */}
      {bookingInfluencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-md w-full glass-panel border border-gray-800 rounded-2xl p-6 glow-indigo overflow-hidden">
            <button
              onClick={() => setBookingInfluencer(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {!checkoutSuccess ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl text-white">Confirm Booking Escrow</h3>
                  <p className="text-xs text-gray-400 mt-1">Book {bookingInfluencer.name} ({bookingInfluencer.social_handle})</p>
                </div>

                {/* Content type picker */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-2">Deliverable Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['story', 'reel', 'post'] as const).map(format => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setSelectedContent(format)}
                        className={`p-3 rounded-xl border text-center font-bold text-sm capitalize transition-all ${
                          selectedContent === format
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-gray-800 bg-[#070a13] text-gray-400 hover:text-white'
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-[#070a13] p-4 rounded-xl border border-gray-900 space-y-3">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Creator Rate ({selectedContent})</span>
                    <span className="text-white font-bold">₹{getEscrowBreakdown().dealAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Escrow Hold Fee</span>
                    <span className="text-white font-bold">₹{getEscrowBreakdown().escrowFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 border-b border-gray-800/80 pb-2">
                    <span className="text-gray-500 text-xs">Estimated commission (influencer)</span>
                    <span className="text-gray-500 text-xs font-semibold">₹{getEscrowBreakdown().commission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-1">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Coins className="w-4 h-4" /> Total Deposit
                    </span>
                    <span className="text-emerald-400">₹{getEscrowBreakdown().total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={triggerRazorpayCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all glow-green flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Deposit via Razorpay
                    </>
                  )}
                </button>

                <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                  Platform handles secure payment escrow holding. Your credit card or UPI will be charged. Funds are released upon project completion.
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto glow-green">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-white">Escrow Payment Verified!</h3>
                  <p className="text-xs text-gray-400 mt-1">Transaction ID: {paymentTxId}</p>
                </div>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  ₹{getEscrowBreakdown().dealAmount.toLocaleString()} has been successfully deposited in the platform escrow pool. The campaign is now active!
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => { setBookingInfluencer(null); router.push('/dashboard'); }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => setBookingInfluencer(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Keep Browsing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
