import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#070a13] border-t border-gray-900 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex flex-col gap-1 items-center md:items-start">
          <p className="font-semibold text-gray-400">CollabEscrow MVP Phase 1</p>
          <p>© {new Date().getFullYear()} CollabEscrow. All rights reserved.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/marketplace" className="hover:text-indigo-400 transition-colors">Marketplace</Link>
          <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
