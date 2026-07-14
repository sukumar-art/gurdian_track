'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { db, Influencer, Transaction } from '../../lib/db';
import {
  ShieldCheck,
  Users,
  Coins,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  AlertCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  X
} from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'kyc' | 'transactions'>('kyc');
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewKycUrl, setPreviewKycUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      // Redirect non-admins or unauthenticated users
      router.push('/login');
      return;
    }

    const loadAdminData = async () => {
      setLoading(true);
      try {
        const infs = await db.getInfluencers();
        setInfluencers(infs);

        const txs = await db.getTransactions('', 'admin');
        setTransactions(txs);
      } catch (err) {
        setErrorMsg('Failed to load administrative logs.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      loadAdminData();
    }
  }, [user, authLoading, router]);

  const handleKycStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionId(id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await db.updateInfluencerProfile(id, { kyc_status: status });
      if (res.success) {
        setSuccessMsg(`KYC status successfully updated to ${status}.`);
        // Refresh local state
        const infs = await db.getInfluencers();
        setInfluencers(infs);
      } else {
        setErrorMsg(res.error || 'Failed to update KYC status.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during KYC processing.');
    } finally {
      setActionId(null);
    }
  };

  const exportTransactionsToCsv = () => {
    if (transactions.length === 0) {
      alert('No transactions available to export.');
      return;
    }

    // Define CSV Headers
    const headers = ['Transaction ID', 'Startup', 'Influencer', 'Handle', 'Deal Amount (INR)', 'Commission (INR)', 'Escrow Fee (INR)', 'Status', 'Payment ID', 'Created At'];
    
    // Map transactions to CSV rows
    const rows = transactions.map(t => [
      t.id,
      t.startup_name,
      t.influencer_name,
      t.influencer_handle,
      t.amount,
      t.commission,
      t.escrow_fee,
      t.status,
      t.razorpay_payment_id || 'N/A',
      t.created_at
    ]);

    // Construct CSV String
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `marketplace_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If loading user state
  if (authLoading || (user && user.role !== 'admin' && !authLoading)) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#0b0f19]">
        <div className="animate-pulse text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-gray-400 text-sm">Authorizing admin access...</span>
        </div>
      </div>
    );
  }

  // Double check admin role
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex-grow flex items-center justify-center px-4 bg-[#0b0f19]">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-gray-800 text-center space-y-6">
          <Lock className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-gray-400 text-sm">You do not have administrative privileges to access this console.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm inline-flex items-center gap-1.5"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Panel Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800/80 glow-indigo mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-400" /> Platform Admin Panel
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage KYC documents, verify transactions, and audit platform finances.</p>
        </div>
        
        {activeTab === 'transactions' && (
          <button
            onClick={exportTransactionsToCsv}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all glow-indigo flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report (CSV)
          </button>
        )}
      </div>

      {/* Alert Banners */}
      {successMsg && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'kyc'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> KYC Verification ({influencers.filter(i => i.kyc_status === 'pending').length} pending)
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" /> Escrow Transactions Log ({transactions.length})
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-gray-500 text-sm">Syncing platform logs...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: KYC VERIFICATION */}
          {activeTab === 'kyc' && (
            <div className="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden">
              {influencers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No influencers registered on the platform.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase bg-slate-900/50">
                        <th className="px-6 py-3">Creator Name</th>
                        <th className="px-6 py-3">Handle</th>
                        <th className="px-6 py-3">Niche / Followers</th>
                        <th className="px-6 py-3">KYC Document</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
                      {influencers.map(inf => (
                        <tr key={inf.id} className="hover:bg-slate-900/20 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{inf.name}</td>
                          <td className="px-6 py-4 text-cyan-400">{inf.social_handle}</td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-white">{inf.follower_count.toLocaleString()}</span> ({inf.niche})
                          </td>
                          <td className="px-6 py-4">
                            {inf.kyc_doc_url ? (
                              <button
                                type="button"
                                onClick={() => setPreviewKycUrl(inf.kyc_doc_url || null)}
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline text-xs bg-transparent border-0 cursor-pointer"
                              >
                                View Doc <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-gray-500 text-xs">No document</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {inf.kyc_status === 'approved' && (
                              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-500/20">Approved</span>
                            )}
                            {inf.kyc_status === 'pending' && (
                              <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full text-xs font-medium border border-yellow-500/20 animate-pulse">Pending Review</span>
                            )}
                            {inf.kyc_status === 'rejected' && (
                              <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full text-xs font-medium border border-rose-500/20">Rejected</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {inf.kyc_status === 'pending' && (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleKycStatus(inf.id, 'approved')}
                                  disabled={actionId === inf.id}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleKycStatus(inf.id, 'rejected')}
                                  disabled={actionId === inf.id}
                                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSACTIONS LOG */}
          {activeTab === 'transactions' && (
            <div className="glass-panel rounded-2xl border border-gray-800/80 overflow-hidden">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No escrow transactions recorded on the platform.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase bg-slate-900/50">
                        <th className="px-6 py-3">Startup</th>
                        <th className="px-6 py-3">Creator</th>
                        <th className="px-6 py-3">Deal Value</th>
                        <th className="px-6 py-3">Platform Fee (10-15%)</th>
                        <th className="px-6 py-3">Escrow Fee</th>
                        <th className="px-6 py-3">Payment ID</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{tx.startup_name}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{tx.influencer_name}</div>
                            <span className="text-xs text-cyan-400">{tx.influencer_handle}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-white">₹{Number(tx.amount).toLocaleString()}</td>
                          <td className="px-6 py-4 text-rose-400">₹{Number(tx.commission).toLocaleString()}</td>
                          <td className="px-6 py-4 text-rose-400">₹{Number(tx.escrow_fee).toLocaleString()}</td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.razorpay_payment_id || 'N/A'}</td>
                          <td className="px-6 py-4">
                            {tx.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full text-xs font-medium border border-yellow-500/20">Pending Hold</span>
                            )}
                            {tx.status === 'released' && (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-500/20">Released</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* KYC DOCUMENT SECURE PREVIEW MODAL */}
      {previewKycUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full h-[80vh] glass-panel border border-gray-800 rounded-2xl p-6 glow-indigo flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-lg text-white">KYC Document Preview</h3>
              <button
                onClick={() => setPreviewKycUrl(null)}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow bg-slate-950 rounded-xl border border-gray-900 overflow-hidden flex items-center justify-center relative min-h-[50vh]">
              {previewKycUrl.includes('.pdf') ? (
                <iframe
                  src={previewKycUrl}
                  className="w-full h-full border-0 rounded-xl"
                  title="KYC PDF Viewer"
                />
              ) : (
                <img
                  src={previewKycUrl}
                  alt="KYC Document"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <a
                href={previewKycUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Open in New Tab
              </a>
              <button
                onClick={() => setPreviewKycUrl(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
