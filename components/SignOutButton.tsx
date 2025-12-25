'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/firebase/auth';
import { useState } from 'react';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="w-full py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
