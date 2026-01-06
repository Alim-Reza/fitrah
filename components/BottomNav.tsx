'use client';

import { Home, Video, Plus, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f] border-t border-gray-800">
      <div className="flex items-center justify-around px-2 py-3">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 transition min-w-[60px] ${
            pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Home size={22} strokeWidth={2} />
          <span className="text-[10px]">Home</span>
        </Link>
        
        <Link
          href={loading ? '#' : user ? '/history' : '/login'}
          className={`flex flex-col items-center justify-center gap-1 transition min-w-[60px] ${
            pathname === '/history' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Clock size={22} strokeWidth={2} />
          <span className="text-[10px]">History</span>
        </Link>
        
        <Link
          href={loading ? '#' : user ? '/add-video' : '/login'}
          className="flex flex-col items-center justify-center text-white hover:text-gray-300 transition min-w-[60px]"
        >
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center mb-1">
            <Plus size={20} className="text-black" strokeWidth={2.5} />
          </div>
        </Link>
        
        <button className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-300 transition min-w-[60px] opacity-50 cursor-not-allowed">
          <Video size={22} strokeWidth={2} />
          <span className="text-[10px]">Videos</span>
        </button>
        
        <Link
          href={loading ? '#' : user ? '/profile' : '/login'}
          className={`flex flex-col items-center justify-center gap-1 transition min-w-[60px] ${
            pathname === '/profile' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <User size={22} strokeWidth={2} />
          <span className="text-[10px]">You</span>
        </Link>
      </div>
    </nav>
  );
}
