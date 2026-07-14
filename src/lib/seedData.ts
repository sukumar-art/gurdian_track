// Seed data for the Startup Influencer Marketplace
// Niches: Food, Education

export interface Influencer {
  id: string;
  name: string;
  social_handle: string;
  niche: 'Food' | 'Education';
  region: string;
  follower_count: number;
  rate_card: {
    story: number;
    reel: number;
    post: number;
  };
  kyc_status: 'pending' | 'approved' | 'rejected';
  kyc_doc_url?: string;
  created_at: string;
}

export interface Startup {
  id: string;
  email: string;
  company_name: string;
  budget_range: string; // e.g. "₹10,000 - ₹50,000"
  goal: string;
  created_at: string;
}

const regions = ['Mumbai', 'Delhi-NCR', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'];

const foodHandles = [
  'spicy_bites', 'delhi_street_foodie', 'mumbai_masala', 'baker_girl_tales', 'the_hungry_techie',
  'veg_delights', 'gourmet_traveler', 'taste_of_hyderabad', 'curry_and_coffee', 'sweet_tooth_diaries',
  'fit_foodie_pune', 'indian_spice_trail', 'munching_memories', 'the_daily_cook', 'paneer_passion',
  'biryani_boss', 'chef_ananya_kitchen', 'street_side_stories', 'healthy_plates', 'flavour_fusion',
  'masala_magic', 'the_brunch_club', 'regional_rasoi', 'desi_chow', 'organic_living'
];

const eduHandles = [
  'coder_concepts', 'finance_with_raj', 'ai_simplified', 'history_in_10', 'vocabulary_boost',
  'math_wizard_deepak', 'upsc_helper', 'science_for_kids', 'excel_tricks_ananya', 'design_with_priya',
  'marketing_demystified', 'the_prep_zone', 'code_with_karan', 'psychology_facts', 'astronomy_today',
  'learn_german_fast', 'job_prep_academy', 'startup_growth_hacks', 'speaking_skills', 'web_dev_simplified',
  'data_science_easy', 'creative_writing_101', 'investing_basics', 'legal_rights_india', 'neet_physics'
];

const foodNames = [
  'Amit Sharma', 'Neha Kapoor', 'Rahul Verma', 'Sneha Patel', 'Vikram Singh',
  'Pooja Hegde', 'Rohan Mehra', 'Deepika Reddy', 'Karan Johar', 'Shreya Ghoshal',
  'Arjun Rampal', 'Kriti Sanon', 'Aditya Roy', 'Nisha Aggarwal', 'Sameer Deshmukh',
  'Siddharth Rao', 'Priya Mani', 'Varun Dhawan', 'Ananya Panday', 'Rishabh Pant',
  'Meera Nair', 'Gaurav Gupta', 'Tanvi Shah', 'Jatin Das', 'Swati Mohan'
];

const eduNames = [
  'Rajesh Kumar', 'Simran Jeet', 'Arvind Kejriwal', 'Divya Spandana', 'Abhishek Upmanyu',
  'Deepak Shenoy', 'Sandeep Maheshwari', 'Prajakta Koli', 'Ranveer Allahbadia', 'Ankur Warikoo',
  'Alakh Pandey', 'Dr. Vikas Divyakirti', 'Karan Chaudhary', 'Priya Kumar', 'Shashank Vyas',
  'Neha Kakkar', 'Tanmay Bhat', 'Abish Mathew', 'Nikhil Kamath', 'Shradha Sharma',
  'Kunwar Vijay', 'Pranav Mistry', 'Geeta Phogat', 'Rujuta Diwekar', 'Ritesh Agarwal'
];

export const seedInfluencers: Influencer[] = Array.from({ length: 50 }).map((_, index) => {
  const isFood = index < 25;
  const name = isFood ? foodNames[index] : eduNames[index - 25];
  const social_handle = `@${isFood ? foodHandles[index] : eduHandles[index - 25]}`;
  const niche = isFood ? 'Food' : 'Education';
  const region = regions[Math.floor(Math.random() * regions.length)];
  const follower_count = Math.floor(Math.random() * 450000) + 10000; // 10k to 460k
  
  // Rate card mapping based on follower tier
  const followerMultiplier = follower_count / 10000;
  const story = Math.round((500 + followerMultiplier * 150) / 100) * 100;
  const reel = Math.round((1200 + followerMultiplier * 350) / 100) * 100;
  const post = Math.round((900 + followerMultiplier * 250) / 100) * 100;

  // Status seed: 80% approved, 10% pending, 10% rejected for testing KYC approval flow
  const rand = Math.random();
  const kyc_status = rand < 0.8 ? 'approved' : rand < 0.9 ? 'pending' : 'rejected';

  return {
    id: `influencer-uuid-${index + 1}`,
    name,
    social_handle,
    niche,
    region,
    follower_count,
    rate_card: { story, reel, post },
    kyc_status,
    kyc_doc_url: kyc_status !== 'pending' ? 'https://example.com/kyc-doc-placeholder.pdf' : undefined,
    created_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()
  };
});

const startupNames = [
  'Zoria Pickles', 'Univista', 'EduTech Solutions', 'QuickBites India', 'SkillForge',
  'Bakehouse Premium', 'FitMeal Co.', 'GourmetBox', 'LearnEasy', 'CodeCrafters',
  'FinancePulse', 'MasalaMix', 'UniPrep', 'DataMinds', 'OrganicHarvest',
  'PrepUp', 'SpicySalsa', 'GrowHacks', 'EduQuest', 'VeggieCart'
];

const startupGoals = [
  'Promote premium hand-crafted pickles and increase direct-to-consumer sales',
  'Gain student registrations for our scholarship program',
  'Increase downloads for our new educational learning app',
  'Increase foot traffic to our new franchise outlets',
  'Raise awareness for online coding bootcamps',
  'Promote our sugar-free cakes for the festive season',
  'Acquire subscribers for healthy meal plan subscriptions',
  'Promote luxury food gift boxes to corporates',
  'Promote micro-learning finance courses',
  'Attract developers to our open-source tools',
  'Increase awareness about stock market basics course',
  'Launch our ready-to-eat gravy packets',
  'Promote test prep study bundles',
  'Build brand authority in data engineering',
  'Increase sales for farm-fresh cold pressed oils',
  'Promote civil services mock test series',
  'Promote organic food products line',
  'Grow social media handles traffic',
  'Sign up schools for learning management systems',
  'Promote fast organic vegetable delivery services'
];

export const seedStartups: Startup[] = startupNames.map((name, index) => {
  const budgets = [
    '₹5,000 - ₹20,000', '₹20,000 - ₹50,000', '₹50,000 - ₹1,00,000',
    '₹1,00,000 - ₹3,00,000', '₹3,00,000+'
  ];
  return {
    id: `startup-uuid-${index + 1}`,
    email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@startup.com`,
    company_name: name,
    budget_range: budgets[Math.floor(Math.random() * budgets.length)],
    goal: startupGoals[index],
    created_at: new Date(Date.now() - index * 2 * 24 * 60 * 60 * 1000).toISOString()
  };
});
