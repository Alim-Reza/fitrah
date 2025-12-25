'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/firebase/auth';
import { createUserVideoList } from '@/lib/firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signUp(email, password);
      
      // Create initial video list for new user
      const defaultVideos = [
        { id: 'FknTw9bJsXM', type: 'video' as const },
        { id: '5JN7SZ6NETQ', type: 'shorts' as const },
        { id: '3Kn7bkpA1-c', type: 'shorts' as const },
      ];

      await createUserVideoList(
        userCredential.user.uid,
        defaultVideos.map((v, i) => ({
          ...v,
          addedAt: new Date(),
          order: i,
        }))
      );

      router.push('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Tab Switcher */}
        <div className="flex bg-[#272727] rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 rounded-md text-sm font-medium transition ${
              activeTab === 'login'
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 rounded-md text-sm font-medium transition ${
              activeTab === 'signup'
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#272727] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#272727] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#272727] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#272727] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#272727] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="Re-enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <button className="text-sm text-gray-400 hover:text-white transition">
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
