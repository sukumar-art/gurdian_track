'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Building2, Mail, Lock, CheckCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, Check, UploadCloud } from 'lucide-react';
import { db } from '../../lib/db';

export default function SignupPage() {
  const { user, signup } = useAuth();
  const router = useRouter();

  // Step state: 1 = Role selection, 2 = Auth credentials, 3 = Profile onboarding
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'startup' | 'influencer'>('startup');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Startup Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [budgetRange, setBudgetRange] = useState('₹5,000 - ₹20,000');
  const [goal, setGoal] = useState('');

  // Influencer Specific Fields
  const [name, setName] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [niche, setNiche] = useState<'Food' | 'Education'>('Food');
  const [region, setRegion] = useState('Mumbai');
  const [followerCount, setFollowerCount] = useState('');
  const [rateStory, setRateStory] = useState('');
  const [rateReel, setRateReel] = useState('');
  const [ratePost, setRatePost] = useState('');
  const [kycDocUrl, setKycDocUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError(null);

    try {
      if (db.isMock) {
        // Mock file upload delay
        setTimeout(() => {
          setKycDocUrl(`https://mock-supabase.storage/kyc-documents/mock_kyc_${Date.now()}_${file.name}`);
          setUploadingFile(false);
        }, 1200);
      } else {
        // Real Supabase storage upload
        const { supabase } = await import('../../lib/db');
        if (!supabase) throw new Error('Supabase not configured');

        const fileExt = file.name.split('.').pop();
        const fileName = `kyc_${Date.now()}.${fileExt}`;
        const filePath = `kyc-documents/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Retrieve public URL
        const { data: { publicUrl } } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(filePath);

        setKycDocUrl(publicUrl);
        setUploadingFile(false);
      }
    } catch (err: any) {
      setError(err.message || 'File upload failed');
      setUploadingFile(false);
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step === 2) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let profileData: any = {};
    if (role === 'startup') {
      if (!companyName || !goal) {
        setError('Please fill out all fields.');
        setLoading(false);
        return;
      }
      profileData = {
        company_name: companyName,
        budget_range: budgetRange,
        goal: goal
      };
    } else {
      if (!name || !socialHandle || !followerCount || !rateStory || !rateReel || !ratePost) {
        setError('Please fill out all fields.');
        setLoading(false);
        return;
      }
      profileData = {
        name,
        social_handle: socialHandle.startsWith('@') ? socialHandle : `@${socialHandle}`,
        niche,
        region,
        follower_count: parseInt(followerCount),
        rate_card: {
          story: parseFloat(rateStory),
          reel: parseFloat(rateReel),
          post: parseFloat(ratePost)
        },
        kyc_doc_url: kycDocUrl || 'https://example.com/kyc-placeholder.pdf' // mock placeholder if empty
      };
    }

    try {
      const res = await signup(email, password, role, profileData);
      if (!res.success) {
        setError(res.error || 'Registration failed.');
      } else {
        // Redirection handled by useEffect
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#0b0f19]">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl border border-gray-800/80 glow-indigo relative overflow-hidden">
        
        {/* Animated Background Accent */}
        <div className="absolute top-[-50px] right-[-50px] w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div>
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Step {step} of 3
            </span>
          </div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {step === 1 && 'Choose your account type'}
            {step === 2 && 'Enter email and password'}
            {step === 3 && `Complete your ${role} profile`}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <div className="space-y-4 mt-6">
            <button
              onClick={() => { setRole('startup'); setStep(2); }}
              className="w-full flex items-center gap-4 p-5 rounded-xl border border-gray-800 hover:border-indigo-500/50 bg-[#070a13] hover:bg-slate-900/50 text-left transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">I am a Startup / Brand</h4>
                <p className="text-sm text-gray-400">Hire, manage, and pay influencers securely in escrow.</p>
              </div>
            </button>

            <button
              onClick={() => { setRole('influencer'); setStep(2); }}
              className="w-full flex items-center gap-4 p-5 rounded-xl border border-gray-800 hover:border-cyan-500/50 bg-[#070a13] hover:bg-slate-900/50 text-left transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">I am an Influencer / Creator</h4>
                <p className="text-sm text-gray-400">List your rate card, get booked, and guarantee payouts.</p>
              </div>
            </button>
          </div>
        )}

        {/* STEP 2: ACCOUNT CREDENTIALS */}
        {step === 2 && (
          <form className="mt-6 space-y-6" onSubmit={handleNext}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-gray-800 bg-[#070a13] placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password (Min. 6 chars)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-gray-800 bg-[#070a13] placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-800 bg-transparent text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all glow-indigo flex items-center justify-center gap-1.5 text-sm font-semibold"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PROFILE ONBOARDING */}
        {step === 3 && (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {/* Startup Profile Onboarding */}
            {role === 'startup' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="appearance-none rounded-xl block w-full px-3 py-2.5 border border-gray-800 bg-[#070a13] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                    placeholder="Zoria Pickles Ltd."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Monthly Influencer Budget</label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="appearance-none rounded-xl block w-full px-3 py-2.5 border border-gray-800 bg-[#070a13] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                  >
                    <option value="₹5,000 - ₹20,000">₹5,000 - ₹20,000 (Micro)</option>
                    <option value="₹20,000 - ₹50,000">₹20,000 - ₹50,000 (Growth)</option>
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000 (Premium)</option>
                    <option value="₹1,00,000 - ₹3,00,000">₹1,00,000 - ₹3,00,000 (Scale)</option>
                    <option value="₹3,00,000+">₹3,00,000+ (Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Campaign Goal</label>
                  <textarea
                    required
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                    className="appearance-none rounded-xl block w-full px-3 py-2.5 border border-gray-800 bg-[#070a13] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all resize-none"
                    placeholder="e.g. Promote our organic farm oils to food bloggers in Hyderabad..."
                  />
                </div>
              </div>
            )}

            {/* Influencer Profile Onboarding */}
            {role === 'influencer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none rounded-xl block w-full px-3 py-2 border border-gray-800 bg-[#070a13] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                      placeholder="Ananya Roy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Social Handle</label>
                    <input
                      type="text"
                      required
                      value={socialHandle}
                      onChange={(e) => setSocialHandle(e.target.value)}
                      className="appearance-none rounded-xl block w-full px-3 py-2 border border-gray-800 bg-[#070a13] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                      placeholder="@ananya_cooks"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Niche</label>
                    <select
                      value={niche}
                      onChange={(e) => setNiche(e.target.value as any)}
                      className="appearance-none rounded-xl block w-full px-2 py-2 border border-gray-800 bg-[#070a13] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="Food">Food</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Region</label>
                    <input
                      type="text"
                      required
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="appearance-none rounded-xl block w-full px-2 py-2 border border-gray-800 bg-[#070a13] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Followers</label>
                    <input
                      type="number"
                      required
                      value={followerCount}
                      onChange={(e) => setFollowerCount(e.target.value)}
                      className="appearance-none rounded-xl block w-full px-2 py-2 border border-gray-800 bg-[#070a13] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Rate Card (₹ INR)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-xs text-gray-500 block mb-0.5">Story</span>
                      <input
                        type="number"
                        required
                        value={rateStory}
                        onChange={(e) => setRateStory(e.target.value)}
                        className="appearance-none rounded-xl block w-full px-2 py-2 border border-gray-800 bg-[#070a13] text-white text-sm"
                        placeholder="1500"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-0.5">Reel</span>
                      <input
                        type="number"
                        required
                        value={rateReel}
                        onChange={(e) => setRateReel(e.target.value)}
                        className="appearance-none rounded-xl block w-full px-2 py-2 border border-gray-800 bg-[#070a13] text-white text-sm"
                        placeholder="3500"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-0.5">Post</span>
                      <input
                        type="number"
                        required
                        value={ratePost}
                        onChange={(e) => setRatePost(e.target.value)}
                        className="appearance-none rounded-xl block w-full px-2 py-2 border border-gray-800 bg-[#070a13] text-white text-sm"
                        placeholder="2500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Upload KYC Document (PDF or Image)</label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:cursor-pointer cursor-pointer border border-gray-850 p-2 rounded-xl"
                  />
                  {uploadingFile && <span className="text-xs text-indigo-400 animate-pulse mt-1 block">Uploading file to storage...</span>}
                  {kycDocUrl && <span className="text-[10px] text-emerald-400 mt-1 block flex items-center gap-1"><Check className="w-3 h-3"/> Uploaded: {kycDocUrl.substring(kycDocUrl.lastIndexOf('/') + 1)}</span>}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-800 bg-transparent text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all glow-indigo flex items-center justify-center gap-1.5 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    Finish Onboarding <CheckCircle className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
