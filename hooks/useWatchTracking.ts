'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { recordWatchSession } from '@/lib/firebase/watch-history';
import { updateScreenTimeUsage } from '@/lib/firebase/screen-time';

interface UseWatchTrackingProps {
  videoId: string;
  type: 'video' | 'shorts';
  isPlaying?: boolean;
}

/**
 * Hook to track video watch time and send to Firebase
 */
export function useWatchTracking({ videoId, type, isPlaying = true }: UseWatchTrackingProps) {
  const { user } = useAuth();
  const watchStartTime = useRef<number>(Date.now());
  const accumulatedTime = useRef<number>(0);
  const lastSaveTime = useRef<number>(Date.now());
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSentInitialView = useRef(false);
  const lastScreenTimeUpdate = useRef<number>(0);

  // Save watch time to Firebase
  const saveWatchTime = useCallback(async (completed: boolean = false) => {
    if (!user) return;

    const currentTime = Date.now();
    const sessionDuration = Math.floor((currentTime - watchStartTime.current) / 1000);
    
    if (sessionDuration > 0) {
      accumulatedTime.current += sessionDuration;
      
      try {
        await recordWatchSession(
          user.uid,
          videoId,
          type,
          accumulatedTime.current,
          completed
        );
        
        // Update screen time usage (convert seconds to minutes)
        const minutesSinceLastUpdate = Math.floor((currentTime - lastScreenTimeUpdate.current) / 60000);
        if (minutesSinceLastUpdate >= 1) {
          await updateScreenTimeUsage(user.uid, minutesSinceLastUpdate);
          lastScreenTimeUpdate.current = currentTime;
        }
        
        lastSaveTime.current = currentTime;
        watchStartTime.current = currentTime;
      } catch (error) {
        console.error('Failed to save watch time:', error);
      }
    }
  }, [user, videoId, type]);

  // Initialize tracking
  useEffect(() => {
    if (!user) return;

    watchStartTime.current = Date.now();
    lastSaveTime.current = Date.now();
    lastScreenTimeUpdate.current = Date.now();
    accumulatedTime.current = 0;
    hasSentInitialView.current = false;

    // Send initial view after 3 seconds
    const initialViewTimeout = setTimeout(() => {
      if (!hasSentInitialView.current) {
        saveWatchTime(false);
        hasSentInitialView.current = true;
      }
    }, 3000);

    // Save watch time every 30 seconds
    saveIntervalRef.current = setInterval(() => {
      if (isPlaying) {
        saveWatchTime(false);
      }
    }, 30000);

    // Cleanup on unmount or video change
    return () => {
      clearTimeout(initialViewTimeout);
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      // Save final watch time
      saveWatchTime(false);
    };
  }, [user, videoId, type, isPlaying, saveWatchTime]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, save current progress
        saveWatchTime(false);
      } else {
        // Page is visible again, reset start time
        watchStartTime.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveWatchTime]);

  return {
    saveWatchTime,
  };
}
