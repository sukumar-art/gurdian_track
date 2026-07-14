'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, DollarSign, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-grow flex flex-col bg-[#0b0f19]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 lg:pt-32">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" /> Next-Gen Escrow Collaboration Engine
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8">
            <span className="block text-white">Hire Creators with</span>
            <span className="block bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-2">
              Secure Escrow Protection
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed mb-10">
            Connecting startups with budget-friendly influencers in <strong>Food</strong> and <strong>Education</strong> niches. Release funds only after content is verified and approved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all glow-indigo hover:translate-y-[-2px] flex items-center justify-center gap-2 group"
            >
              Find Influencers
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto glass-panel hover:bg-slate-900 border border-gray-800 hover:border-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
            >
              Sign Up as Creator
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Ticker Section */}
      <section className="border-y border-gray-900 bg-[#070a13] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-extrabold text-white">50+</p>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-1">Seeded Influencers</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">20+</p>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-1">Pilot Startups</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">100%</p>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-1">Escrow Guaranteed</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">10-15%</p>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-1">Flat Commission</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Why CollabEscrow?</h2>
            <p className="text-gray-400 mt-2 max-w-xl mx-auto">Smarter campaigns with zero payment risk for both sides.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel p-8 rounded-2xl border border-gray-800/80 hover:border-indigo-500/30 transition-all flex flex-col group hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Razorpay Escrow Lock</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Startups deposit payments into holding. Funds are locked securely and only released when content goes live and is approved.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-8 rounded-2xl border border-gray-800/80 hover:border-cyan-500/30 transition-all flex flex-col group hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Transparent Rate Cards</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                No endless negotiation threads. Instantly view story, reel, and post rates directly on influencer profiles for budget-friendly picks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-8 rounded-2xl border border-gray-800/80 hover:border-emerald-500/30 transition-all flex flex-col group hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Verified KYC Creators</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every creator is manually verified by the admin team before listing. Get reliable, real followers without bots or fake engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Escrow Process Walkthrough */}
      <section className="py-16 bg-[#070a13] border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">How the Payment Flow Works</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-white">Startup deposits in Escrow</h4>
                    <p className="text-sm text-gray-400 mt-1">Book an influencer and pay via our integrated Razorpay checkout.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-white">Influencer delivers content</h4>
                    <p className="text-sm text-gray-400 mt-1">The transaction remains "pending". The creator uploads/posts the agreed content.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-white">Startup approves & funds release</h4>
                    <p className="text-sm text-gray-400 mt-1">Once verified, the startup approves and funds are released (minus platform fee).</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-gray-800 glow-cyan">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" /> Transparent Fee Model
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Escrow Security Fee</span>
                  <span className="text-emerald-400 font-bold">₹99 <span className="text-xs text-gray-500">flat</span></span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Platform Commission</span>
                  <span className="text-indigo-400 font-bold">10% - 15%</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Startup Protection</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Free Refund</span>
                </div>
                <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                  If the creator fails to deliver within the timeline, the escrow deposit is refunded to the startup's source payment account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
