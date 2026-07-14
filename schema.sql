-- SQL Schema for Startup Influencer Marketplace

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Startups Table
CREATE TABLE IF NOT EXISTS startups (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  budget_range TEXT,
  goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Influencers Table
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  social_handle TEXT NOT NULL,
  niche TEXT NOT NULL,
  region TEXT NOT NULL,
  follower_count INT NOT NULL DEFAULT 0,
  rate_card JSONB DEFAULT '{}'::jsonb,
  kyc_status TEXT DEFAULT 'pending'::text, -- 'pending', 'approved', 'rejected'
  kyc_doc_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Transactions Table (Escrow Payments)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending'::text, -- 'pending', 'approved', 'released'
  commission NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  escrow_fee NUMERIC(10, 2) NOT NULL DEFAULT 99.00,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS) configurations
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to influencers (so startups can search them)
CREATE POLICY "Allow public read access to influencers" ON influencers
  FOR SELECT USING (true);

-- Allow authenticated users to view/edit their own startup profile
CREATE POLICY "Allow users to manage their own startup profile" ON startups
  FOR ALL USING (auth.uid() = id);

-- Allow authenticated users to manage their own influencer profile
CREATE POLICY "Allow users to manage their own influencer profile" ON influencers
  FOR ALL USING (auth.uid() = id);

-- Allow startups/influencers involved in a transaction to view it
CREATE POLICY "Allow transaction participants to view transactions" ON transactions
  FOR SELECT USING (auth.uid() = startup_id OR auth.uid() = influencer_id);

-- Allow admin level controls
CREATE POLICY "Allow admin read access" ON transactions
  FOR ALL USING (true);
