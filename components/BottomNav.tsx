'use client';

import { Home, Video, Plus, PlaySquare, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

export default function BottomNav() {
  const { user, loading } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f] border-t border-gray-800">
      <div className="flex items-center justify-around px-2 py-3">
        <button className="flex flex-col items-center justify-center gap-1 text-white hover:text-gray-300 transition min-w-[60px]">
          <Home size={22} strokeWidth={2} />
          <span className="text-[10px]">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-1 text-white hover:text-gray-300 transition min-w-[60px]">
          <Video size={22} strokeWidth={2} />
          <span className="text-[10px]">Shorts</span>
        </button>
        <button className="flex flex-col items-center justify-center text-white hover:text-gray-300 transition min-w-[60px]">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center mb-1">
            <Plus size={20} className="text-black" strokeWidth={2.5} />
          </div>
        </button>
        <button className="flex flex-col items-center justify-center gap-1 text-white hover:text-gray-300 transition min-w-[60px]">
          <PlaySquare size={22} strokeWidth={2} />
          <span className="text-[10px]">Subscriptions</span>
        </button>
        <Link
          href={loading ? '#' : user ? '/profile' : '/login'}
          className="flex flex-col items-center justify-center gap-1 text-white hover:text-gray-300 transition min-w-[60px]"
        >
          <User size={22} strokeWidth={2} />
          <span className="text-[10px]">You</span>
        </Link>
      </div>
    </nav>
  );
}
