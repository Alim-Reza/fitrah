'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  getPrayerTimeSettings,
  fetchPrayerTimes,
  isWithinPrayerTime,
  PrayerTimes,
  PrayerTimeSettings,
} from '@/lib/firebase/prayer-times';

interface UsePrayerTimeMonitorReturn {
  isPrayerTime: boolean;
  currentPrayer: string | null;
  prayerTimes: PrayerTimes | null;
  settings: PrayerTimeSettings | null;
  isLoading: boolean;
}

/**
 * Hook to monitor prayer times and trigger actions
 */
export function usePrayerTimeMonitor(): UsePrayerTimeMonitorReturn {
  const { user } = useAuth();
  const [isPrayerTime, setIsPrayerTime] = useState(false);
  const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [settings, setSettings] = useState<PrayerTimeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings and prayer times
  const loadPrayerData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Load user settings
      const userSettings = await getPrayerTimeSettings(user.uid);
      
      if (!userSettings || !userSettings.enabled) {
        setSettings(userSettings);
        setIsLoading(false);
        return;
      }

      setSettings(userSettings);

      // Fetch prayer times
      const times = await fetchPrayerTimes(
        userSettings.latitude,
        userSettings.longitude,
        userSettings.method,
        userSettings.school
      );

      setPrayerTimes(times);
    } catch (error) {
      console.error('Error loading prayer data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Check if current time is prayer time
  const checkPrayerTime = useCallback(() => {
    if (!prayerTimes || !settings || !settings.enabled) {
      setIsPrayerTime(false);
      setCurrentPrayer(null);
      return;
    }

    const result = isWithinPrayerTime(prayerTimes);
    setIsPrayerTime(result.isPrayerTime);
    setCurrentPrayer(result.currentPrayer);
  }, [prayerTimes, settings]);

  // Initial load
  useEffect(() => {
    loadPrayerData();
  }, [loadPrayerData]);

  // Check prayer time every minute
  useEffect(() => {
    if (!settings || !settings.enabled || !prayerTimes) return;

    checkPrayerTime();

    const interval = setInterval(() => {
      checkPrayerTime();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [prayerTimes, settings, checkPrayerTime]);

  // Reload prayer times at midnight
  useEffect(() => {
    if (!settings || !settings.enabled) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      loadPrayerData();
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [settings, loadPrayerData]);

  return {
    isPrayerTime,
    currentPrayer,
    prayerTimes,
    settings,
    isLoading,
  };
}
