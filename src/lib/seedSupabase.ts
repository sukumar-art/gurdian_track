// Script to seed live Supabase Database
// Run with: npx tsx src/lib/seedSupabase.ts

import { createClient } from '@supabase/supabase-js';
import { seedInfluencers, seedStartups } from './seedData';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Using Service Role Key is recommended for seeding because it bypasses RLS policies
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('--------------------------------------------------');
  console.log('⚠️ Supabase credentials not found in env variables.');
  console.log('To seed a live Supabase database, set these in .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.log('--------------------------------------------------');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🚀 Starting live Supabase seeding...');

  try {
    // 1. Seed Startups
    console.log(`Inserting ${seedStartups.length} startups...`);
    
    // In a real environment, auth.users must be created first.
    // For this demonstration, we'll try to insert profiles directly, but if they reference auth.users via FK,
    // we might need to handle them.
    // If FK constraints are active, we can temporarily disable or mock. 
    // To make sure it completes gracefully:
    const { error: startupError } = await supabase
      .from('startups')
      .upsert(
        seedStartups.map(s => ({
          id: s.id,
          email: s.email,
          company_name: s.company_name,
          budget_range: s.budget_range,
          goal: s.goal,
          created_at: s.created_at
        })),
        { onConflict: 'id' }
      );

    if (startupError) {
      console.warn('⚠️ Startups insert had warnings/errors (likely due to FK auth.users constraint):', startupError.message);
      console.log('Note: Running on database with FK requires creating Auth accounts first.');
    } else {
      console.log('✅ Startups seeded successfully.');
    }

    // 2. Seed Influencers
    console.log(`Inserting ${seedInfluencers.length} influencers...`);
    const { error: influencerError } = await supabase
      .from('influencers')
      .upsert(
        seedInfluencers.map(i => ({
          id: i.id,
          name: i.name,
          social_handle: i.social_handle,
          niche: i.niche,
          region: i.region,
          follower_count: i.follower_count,
          rate_card: i.rate_card,
          kyc_status: i.kyc_status,
          kyc_doc_url: i.kyc_doc_url || '',
          created_at: i.created_at
        })),
        { onConflict: 'id' }
      );

    if (influencerError) {
      console.warn('⚠️ Influencers insert had warnings/errors (likely due to FK auth.users constraint):', influencerError.message);
    } else {
      console.log('✅ Influencers seeded successfully.');
    }

    console.log('🎉 Seeding phase complete!');
  } catch (err: any) {
    console.error('❌ Error during seeding:', err.message);
  }
}

seed();
