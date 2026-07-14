'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db, Transaction, Startup, Influencer } from '../../lib/db';
import {
  TrendingUp,
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  Briefcase,
  Users,
  Coins,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startupProfile, setStartupProfile] = useState<Startup | null>(null);
  const [influencerProfile, setInfluencerProfile] = useState<Influencer | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user?.role === 'admin') {
      router.push('/admin');
      return;
    }

    const loadDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        // Load role specific profile
        if (user.role === 'startup') {
          const profile = await db.getStartupById(user.id);
          setStartupProfile(profile);
        } else if (user.role === 'influencer') {
          const profile = await db.getInfluencerById(user.id);
          setInfluencerProfile(profile);
        }

        // Load transactions
        const txs = await db.getTransactions(user.id, user.role);
        setTransactions(txs);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const handleApproveRelease = async (txId: string) => {
    setActionLoading(txId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/transactions/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId })
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(`Escrow funds released successfully! Net payout: ₹${data.netPayout.toLocaleString()} (Commission: ₹${data.commission}, Fee: ₹${data.escrowFee})`);
        // Refresh transactions list
        if (user) {
          const txs = await db.getTransactions(user.id, user.role);
          setTransactions(txs);
        }
      } else {
        setError(data.error || 'Failed to release funds.');
      }
    } catch (err) {
      setError('An error occurred during transaction processing.');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#0b0f19]">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          <span className="text-gray-400 text-sm">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Alert Banners */}
      {error && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" /> {success}
        </div>
      )}

      {/* STARTUP DASHBOARD VIEW */}
      {user?.role === 'startup' && startupProfile && (
        <div className="space-y-8">
          {/* Header Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800/80 glow-indigo flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome, {startupProfile.company_name}</h1>
              <p className="text-gray-400 text-sm mt-1">Goal: {startupProfile.goal}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-semibold border border-indigo-500/20">
                  Budget: {startupProfile.budget_range}
                </span>
                <span className="text-xs bg-slate-800 text-gray-400 px-3 py-1 rounded-full">
                  Startup ID: {startupProfile.id.substring(0, 8)}
                </span>
              </div>
            </div>
            <div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all glow-indigo hover:translate-y-[-1px] group"
              >
                Find Influencers
                <Search className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{transactions.length}</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Funds in Escrow</p>
                <p className="text-2xl font-bold text-white">
                  ₹{transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Completed Payouts</p>
                <p className="text-2xl font-bold text-white">
                  ₹{transactions.filter(t => t.status === 'released').reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Collaboration Transactions</h3>
            </div>
            
            {transactions.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p>No transactions found. Book an influencer from the marketplace to get started!</p>
                <Link href="/marketplace" className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm mt-2 inline-flex items-center gap-1">
                  Go to Marketplace <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase bg-slate-900/50">
                      <th className="px-6 py-3">Influencer</th>
                      <th className="px-6 py-3">Niche/Handle</th>
                      <th className="px-6 py-3">Escrow Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Payment ID</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">{tx.influencer_name}</td>
                        <td className="px-6 py-4 text-cyan-400">{tx.influencer_handle}</td>
                        <td className="px-6 py-4 font-bold text-white">₹{Number(tx.amount).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          {tx.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full text-xs font-medium border border-yellow-500/20">
                              <Clock className="w-3.5 h-3.5" /> Pending Approval
                            </span>
                          )}
                          {tx.status === 'released' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                              <CheckCircle className="w-3.5 h-3.5" /> Funds Released
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.razorpay_payment_id || 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          {tx.status === 'pending' && (
                            <button
                              onClick={() => handleApproveRelease(tx.id)}
                              disabled={actionLoading === tx.id}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              Approve & Release
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INFLUENCER DASHBOARD VIEW */}
      {user?.role === 'influencer' && influencerProfile && (
        <div className="space-y-8">
          {/* KYC Status banner if not approved */}
          {influencerProfile.kyc_status === 'pending' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 rounded-xl text-sm flex items-center gap-3">
              <Clock className="w-6 h-6 shrink-0 animate-pulse" />
              <div>
                <h4 className="font-bold">KYC Verification Under Review</h4>
                <p className="text-xs mt-0.5 text-gray-400">
                  Your uploaded KYC documents are currently being checked. You will appear on the marketplace search once approved.
                </p>
              </div>
            </div>
          )}
          {influencerProfile.kyc_status === 'rejected' && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm flex items-center gap-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold">KYC Verification Rejected</h4>
                <p className="text-xs mt-0.5 text-gray-400">
                  Please update your KYC documents or contact support to resolve validation issues.
                </p>
              </div>
            </div>
          )}

          {/* Header Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800/80 glow-indigo flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{influencerProfile.name}</h1>
                <span className="text-cyan-400 text-sm font-semibold">{influencerProfile.social_handle}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Region: {influencerProfile.region} | Niche: {influencerProfile.niche}</p>
              
              <div className="flex items-center gap-3 mt-4">
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-semibold border border-indigo-500/20">
                  Followers: {influencerProfile.follower_count.toLocaleString()}
                </span>
                {influencerProfile.kyc_status === 'approved' ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> KYC Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-500/20">
                    KYC {influencerProfile.kyc_status}
                  </span>
                )}
              </div>
            </div>

            {/* Rate cards display */}
            <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-gray-800">
              <div className="text-center px-3 border-r border-gray-800">
                <span className="text-xs text-gray-500 block">Story</span>
                <span className="text-sm font-bold text-white">₹{influencerProfile.rate_card.story}</span>
              </div>
              <div className="text-center px-3 border-r border-gray-800">
                <span className="text-xs text-gray-500 block">Reel</span>
                <span className="text-sm font-bold text-white">₹{influencerProfile.rate_card.reel}</span>
              </div>
              <div className="text-center px-3">
                <span className="text-xs text-gray-500 block">Post</span>
                <span className="text-sm font-bold text-white">₹{influencerProfile.rate_card.post}</span>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Assigned Campaigns</p>
                <p className="text-2xl font-bold text-white">{transactions.length}</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Locked in Escrow</p>
                <p className="text-2xl font-bold text-white">
                  ₹{transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Withdrawn Earnings</p>
                <p className="text-2xl font-bold text-white">
                  ₹{transactions.filter(t => t.status === 'released').reduce((sum, t) => sum + (Number(t.amount) - Number(t.commission) - Number(t.escrow_fee)), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-800">
              <h3 className="font-bold text-lg text-white">Active bookings & Payout details</h3>
            </div>
            
            {transactions.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p>No bookings assigned yet. Startups will reach out once your profile is verified!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase bg-slate-900/50">
                      <th className="px-6 py-3">Startup Name</th>
                      <th className="px-6 py-3">Gross Deal</th>
                      <th className="px-6 py-3">Platform Fee (10-15%)</th>
                      <th className="px-6 py-3">Escrow Fee</th>
                      <th className="px-6 py-3">Net Payout</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
                    {transactions.map(tx => {
                      const netPayout = Number(tx.amount) - Number(tx.commission) - Number(tx.escrow_fee);
                      return (
                        <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{tx.startup_name}</td>
                          <td className="px-6 py-4 font-semibold">₹{Number(tx.amount).toLocaleString()}</td>
                          <td className="px-6 py-4 text-rose-400">-₹{Number(tx.commission).toLocaleString()}</td>
                          <td className="px-6 py-4 text-rose-400">-₹{Number(tx.escrow_fee).toLocaleString()}</td>
                          <td className="px-6 py-4 font-bold text-emerald-400">₹{netPayout.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            {tx.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full text-xs font-medium border border-yellow-500/20">
                                <Clock className="w-3.5 h-3.5" /> Pending Release
                              </span>
                            )}
                            {tx.status === 'released' && (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                                <CheckCircle className="w-3.5 h-3.5" /> Payout Released
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
