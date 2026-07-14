import { createClient } from '@supabase/supabase-js';
import { seedInfluencers, seedStartups, type Influencer, type Startup } from './seedData';
export type { Influencer, Startup };

// Types
export interface Transaction {
  id: string;
  startup_id: string;
  influencer_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'released';
  commission: number;
  escrow_fee: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  // Joins (optional for display)
  startup_name?: string;
  influencer_name?: string;
  influencer_handle?: string;
}

export interface UserSession {
  id: string;
  email: string;
  role: 'startup' | 'influencer' | 'admin';
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

// Live Supabase Client (only created if details are configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// LOCAL STORAGE MOCK ENGINE
// ==========================================
class MockDbEngine {
  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (!localStorage.getItem('marketplace_influencers')) {
      localStorage.setItem('marketplace_influencers', JSON.stringify(seedInfluencers));
    }
    if (!localStorage.getItem('marketplace_startups')) {
      localStorage.setItem('marketplace_startups', JSON.stringify(seedStartups));
    }
    if (!localStorage.getItem('marketplace_transactions')) {
      localStorage.setItem('marketplace_transactions', JSON.stringify([]));
    }
    if (!localStorage.getItem('marketplace_users')) {
      // Create a default admin user and seed user credentials for mock logging
      const defaultUsers = [
        { id: 'admin-uuid', email: 'admin@marketplace.com', password: 'admin', role: 'admin' },
        ...seedStartups.map(s => ({ id: s.id, email: s.email, password: 'password', role: 'startup' })),
        ...seedInfluencers.map(i => ({ id: i.id, email: `${i.social_handle.substring(1)}@influencer.com`, password: 'password', role: 'influencer' }))
      ];
      localStorage.setItem('marketplace_users', JSON.stringify(defaultUsers));
    }
  }

  // Getters & Setters
  getInfluencers(): Influencer[] {
    this.init();
    return JSON.parse(localStorage.getItem('marketplace_influencers') || '[]');
  }

  saveInfluencers(influencers: Influencer[]) {
    localStorage.setItem('marketplace_influencers', JSON.stringify(influencers));
  }

  getStartups(): Startup[] {
    this.init();
    return JSON.parse(localStorage.getItem('marketplace_startups') || '[]');
  }

  saveStartups(startups: Startup[]) {
    localStorage.setItem('marketplace_startups', JSON.stringify(startups));
  }

  getTransactions(): Transaction[] {
    this.init();
    return JSON.parse(localStorage.getItem('marketplace_transactions') || '[]');
  }

  saveTransactions(transactions: Transaction[]) {
    localStorage.setItem('marketplace_transactions', JSON.stringify(transactions));
  }

  getUsers() {
    this.init();
    return JSON.parse(localStorage.getItem('marketplace_users') || '[]');
  }

  saveUsers(users: any[]) {
    localStorage.setItem('marketplace_users', JSON.stringify(users));
  }
}

const mockEngine = new MockDbEngine();

// ==========================================
// UNIFIED DATA ACCESS LAYER
// ==========================================
export const db = {
  isMock: !isSupabaseConfigured,

  // --- Auth Operations ---
  async getCurrentUser(): Promise<UserSession | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Determine role from metadata or check tables
      const role = user.user_metadata?.role || 'startup';
      return { id: user.id, email: user.email || '', role };
    } else {
      if (typeof window === 'undefined') return null;
      const session = localStorage.getItem('marketplace_session');
      return session ? JSON.parse(session) : null;
    }
  },

  async signUp(email: string, password: string, role: 'startup' | 'influencer', profileData: any): Promise<{ user: UserSession | null; error: string | null }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      });
      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'Sign up failed' };

      // Write profile to appropriate table
      const profileTable = role === 'startup' ? 'startups' : 'influencers';
      const record = {
        id: data.user.id,
        email,
        created_at: new Date().toISOString(),
        ...profileData
      };
      
      const { error: insertError } = await supabase.from(profileTable).insert(record);
      if (insertError) return { user: null, error: insertError.message };

      return { user: { id: data.user.id, email, role }, error: null };
    } else {
      const users = mockEngine.getUsers();
      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        return { user: null, error: 'User already exists' };
      }

      const id = `${role}-uuid-${Date.now()}`;
      const newUser = { id, email, password, role };
      users.push(newUser);
      mockEngine.saveUsers(users);

      if (role === 'startup') {
        const startups = mockEngine.getStartups();
        startups.push({
          id,
          email,
          company_name: profileData.company_name || 'My Startup',
          budget_range: profileData.budget_range || '₹5,000 - ₹20,000',
          goal: profileData.goal || 'General awareness',
          created_at: new Date().toISOString()
        });
        mockEngine.saveStartups(startups);
      } else {
        const influencers = mockEngine.getInfluencers();
        influencers.push({
          id,
          name: profileData.name || 'New Influencer',
          social_handle: profileData.social_handle || '@new_influencer',
          niche: profileData.niche || 'Food',
          region: profileData.region || 'Mumbai',
          follower_count: parseInt(profileData.follower_count || '0'),
          rate_card: profileData.rate_card || { story: 1000, reel: 2000, post: 1500 },
          kyc_status: 'pending',
          kyc_doc_url: profileData.kyc_doc_url || '',
          created_at: new Date().toISOString()
        });
        mockEngine.saveInfluencers(influencers);
      }

      const sessionUser: UserSession = { id, email, role };
      localStorage.setItem('marketplace_session', JSON.stringify(sessionUser));
      return { user: sessionUser, error: null };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: UserSession | null; error: string | null }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'Login failed' };
      
      const role = data.user.user_metadata?.role || 'startup';
      return { user: { id: data.user.id, email, role }, error: null };
    } else {
      const users = mockEngine.getUsers();
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (!user) {
        return { user: null, error: 'Invalid email or password' };
      }

      const sessionUser: UserSession = { id: user.id, email: user.email, role: user.role };
      localStorage.setItem('marketplace_session', JSON.stringify(sessionUser));
      return { user: sessionUser, error: null };
    }
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('marketplace_session');
    }
  },

  // --- Startup Profile Operations ---
  async getStartupById(id: string): Promise<Startup | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('startups').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    } else {
      const startups = mockEngine.getStartups();
      return startups.find(s => s.id === id) || null;
    }
  },

  async updateStartupProfile(id: string, data: Partial<Startup>): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('startups').update(data).eq('id', id);
      return { success: !error, error: error ? error.message : null };
    } else {
      const startups = mockEngine.getStartups();
      const idx = startups.findIndex(s => s.id === id);
      if (idx === -1) return { success: false, error: 'Startup profile not found' };
      
      startups[idx] = { ...startups[idx], ...data };
      mockEngine.saveStartups(startups);
      return { success: true, error: null };
    }
  },

  // --- Influencer Profile Operations ---
  async getInfluencers(): Promise<Influencer[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('influencers').select('*').order('follower_count', { ascending: false });
      if (error) return [];
      return data;
    } else {
      return mockEngine.getInfluencers().sort((a, b) => b.follower_count - a.follower_count);
    }
  },

  async getInfluencerById(id: string): Promise<Influencer | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('influencers').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    } else {
      const influencers = mockEngine.getInfluencers();
      return influencers.find(i => i.id === id) || null;
    }
  },

  async updateInfluencerProfile(id: string, data: Partial<Influencer>): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('influencers').update(data).eq('id', id);
      return { success: !error, error: error ? error.message : null };
    } else {
      const influencers = mockEngine.getInfluencers();
      const idx = influencers.findIndex(i => i.id === id);
      if (idx === -1) return { success: false, error: 'Influencer profile not found' };
      
      influencers[idx] = { ...influencers[idx], ...data };
      mockEngine.saveInfluencers(influencers);
      return { success: true, error: null };
    }
  },

  // --- Escrow Transactions Operations ---
  async getTransactions(userId: string, role: 'startup' | 'influencer' | 'admin'): Promise<Transaction[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('transactions').select(`
        *,
        startups (company_name),
        influencers (name, social_handle)
      `);
      
      if (role === 'startup') {
        query = query.eq('startup_id', userId);
      } else if (role === 'influencer') {
        query = query.eq('influencer_id', userId);
      }
      // Admins get everything
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return [];
      
      return data.map((t: any) => ({
        ...t,
        startup_name: t.startups?.company_name || 'Unknown Startup',
        influencer_name: t.influencers?.name || 'Unknown Influencer',
        influencer_handle: t.influencers?.social_handle || '@unknown'
      }));
    } else {
      const transactions = mockEngine.getTransactions();
      const startups = mockEngine.getStartups();
      const influencers = mockEngine.getInfluencers();
      
      let filtered = transactions;
      if (role === 'startup') {
        filtered = transactions.filter(t => t.startup_id === userId);
      } else if (role === 'influencer') {
        filtered = transactions.filter(t => t.influencer_id === userId);
      }

      return filtered.map(t => {
        const s = startups.find(st => st.id === t.startup_id);
        const i = influencers.find(inf => inf.id === t.influencer_id);
        return {
          ...t,
          startup_name: s ? s.company_name : 'Unknown Startup',
          influencer_name: i ? i.name : 'Unknown Influencer',
          influencer_handle: i ? i.social_handle : '@unknown'
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },
  async getTransactionByOrderId(orderId: string): Promise<Transaction | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('transactions').select('*').eq('razorpay_order_id', orderId).single();
      if (error) return null;
      return data;
    } else {
      const transactions = mockEngine.getTransactions();
      return transactions.find(t => t.razorpay_order_id === orderId) || null;
    }
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<{ transaction: Transaction | null; error: string | null }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('transactions').insert([transaction]).select().single();
      if (error) return { transaction: null, error: error.message };
      return { transaction: data, error: null };
    } else {
      const transactions = mockEngine.getTransactions();
      const newTx: Transaction = {
        ...transaction,
        id: `tx-uuid-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      transactions.push(newTx);
      mockEngine.saveTransactions(transactions);
      return { transaction: newTx, error: null };
    }
  },

  async updateTransactionStatus(
    id: string,
    status: 'pending' | 'approved' | 'released',
    razorpayPaymentId?: string,
    commission?: number,
    escrowFee?: number
  ): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured && supabase) {
      const updateData: any = { status };
      if (razorpayPaymentId) {
        updateData.razorpay_payment_id = razorpayPaymentId;
      }
      if (commission !== undefined) {
        updateData.commission = commission;
      }
      if (escrowFee !== undefined) {
        updateData.escrow_fee = escrowFee;
      }
      const { error } = await supabase.from('transactions').update(updateData).eq('id', id);
      return { success: !error, error: error ? error.message : null };
    } else {
      const transactions = mockEngine.getTransactions();
      const idx = transactions.findIndex(t => t.id === id);
      if (idx === -1) return { success: false, error: 'Transaction not found' };
      
      transactions[idx].status = status;
      if (razorpayPaymentId) {
        transactions[idx].razorpay_payment_id = razorpayPaymentId;
      }
      if (commission !== undefined) {
        transactions[idx].commission = commission;
      }
      if (escrowFee !== undefined) {
        transactions[idx].escrow_fee = escrowFee;
      }
      
      mockEngine.saveTransactions(transactions);
      return { success: true, error: null };
    }
  }
};
