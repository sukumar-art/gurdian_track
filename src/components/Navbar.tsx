'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, LogOut, Search, BookOpen, Layers } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-gray-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center glow-indigo">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-95 transition-all">
            Collab<span className="text-indigo-400 font-extrabold">Escrow</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/marketplace" className="text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-sm font-medium">
            <Search className="w-4 h-4" /> Find Influencers
          </Link>
          {user && (
            <Link href="/dashboard" className="text-gray-300 hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-sm font-medium">
              <BookOpen className="w-4 h-4" /> Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-sm font-medium">
              <ShieldCheck className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.email}</span>
                <span className="text-xs text-indigo-400 capitalize">{user.role}</span>
              </div>
              
              <Link href="/dashboard">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-indigo-500/30 flex items-center justify-center text-indigo-400 hover:border-indigo-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="bg-transparent hover:bg-slate-800 text-gray-400 hover:text-rose-400 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium border border-gray-800/80"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all glow-indigo hover:translate-y-[-1px]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
