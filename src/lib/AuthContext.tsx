'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, UserSession } from './db';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signup: (email: string, password: string, role: 'startup' | 'influencer', profileData: any) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await db.getCurrentUser();
      setUser(currentUser);
    } catch (e) {
      console.error('Error fetching current user:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { user: sessionUser, error } = await db.signIn(email, password);
    if (sessionUser) {
      setUser(sessionUser);
      setLoading(false);
      return { success: true, error: null };
    }
    setLoading(false);
    return { success: false, error };
  };

  const signup = async (email: string, password: string, role: 'startup' | 'influencer', profileData: any) => {
    setLoading(true);
    const { user: sessionUser, error } = await db.signUp(email, password, role, profileData);
    if (sessionUser) {
      setUser(sessionUser);
      setLoading(false);
      return { success: true, error: null };
    }
    setLoading(false);
    return { success: false, error };
  };

  const logout = async () => {
    setLoading(true);
    await db.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
