'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import {
  getScreenTimeLimits,
  getTodayScreenTimeUsage,
  checkActiveSchedule,
  subscribeToScreenTimeLimits,
  ScreenTimeLimit,
  ScreenTimeUsage,
} from '@/lib/firebase/screen-time';
import { Clock, X, Lock } from 'lucide-react';

export default function ScreenTimeLockOverlay() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [usage, setUsage] = useState<ScreenTimeUsage | null>(null);
  const [limits, setLimits] = useState<ScreenTimeLimit | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLocked(false);
      return;
    }

    // Subscribe to limit changes
    const unsubscribe = subscribeToScreenTimeLimits(user.uid, (newLimits) => {
      setLimits(newLimits);
      checkLockStatus(newLimits);
    });

    // Load initial usage
    loadUsage();

    // Check lock status every minute
    const interval = setInterval(() => {
      if (limits) {
        checkLockStatus(limits);
      }
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  async function loadUsage() {
    if (!user) return;
    const todayUsage = await getTodayScreenTimeUsage(user.uid);
    setUsage(todayUsage);
  }

  function checkLockStatus(currentLimits: ScreenTimeLimit | null) {
    if (!currentLimits || !currentLimits.enabled || !user) {
      setIsLocked(false);
      return;
    }

    // Check if within a blocked schedule
    const scheduleCheck = checkActiveSchedule(currentLimits.schedules);
    if (scheduleCheck.isBlocked) {
      setIsLocked(true);
      setLockMessage(
        scheduleCheck.activeSchedule?.name
          ? `${scheduleCheck.activeSchedule.name} - Videos are blocked during this time`
          : 'Videos are blocked during this time'
      );
      return;
    }

    // Check daily limit
    if (usage && usage.totalMinutes >= currentLimits.dailyLimitMinutes) {
      setIsLocked(true);
      setLockMessage(
        currentLimits.lockMessage ||
          `Daily limit of ${currentLimits.dailyLimitMinutes} minutes reached. Come back tomorrow!`
      );
      return;
    }

    setIsLocked(false);
  }

  function formatTimeRemaining() {
    if (!limits || !usage) return '';
    const remaining = limits.dailyLimitMinutes - usage.totalMinutes;
    if (remaining <= 0) return '0 minutes';
    
    const hours = Math.floor(remaining / 60);
    const minutes = remaining % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  }

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center">
      <div className="relative max-w-md w-full mx-4 bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-500/30 rounded-2xl p-8 text-center">
        {/* Lock icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-red-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3">Screen Time Limit Reached</h2>

        {/* Message */}
        <p className="text-gray-200 text-lg mb-6">{lockMessage}</p>

        {/* Usage info */}
        {usage && limits && (
          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Today's watch time:</span>
              <span className="text-white font-semibold">{usage.totalMinutes} minutes</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-400">Daily limit:</span>
              <span className="text-white font-semibold">{limits.dailyLimitMinutes} minutes</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition"
          >
            Go to Home
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition"
          >
            View Settings
          </button>
        </div>

        {/* Small text */}
        <p className="text-gray-400 text-xs mt-4">
          This limit helps maintain healthy screen time habits
        </p>
      </div>
    </div>
  );
}
