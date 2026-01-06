'use client';

import { useEffect, useState } from 'react';
import { usePrayerTimeMonitor } from '@/hooks/usePrayerTimeMonitor';
import { Mic, X } from 'lucide-react';

export default function AdhanOverlay() {
  const { isPrayerTime, currentPrayer, settings } = usePrayerTimeMonitor();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownForCurrentPrayer, setHasShownForCurrentPrayer] = useState<string | null>(null);

  useEffect(() => {
    if (
      isPrayerTime &&
      currentPrayer &&
      settings?.enabled &&
      settings?.pauseVideos &&
      currentPrayer !== hasShownForCurrentPrayer
    ) {
      setIsVisible(true);
      setHasShownForCurrentPrayer(currentPrayer);

      // Play Adhan sound if enabled
      if (settings.playAdhan) {
        const audio = new Audio('/adhan.mp3');
        audio.play().catch((error) => {
          console.error('Failed to play Adhan:', error);
        });
      }

      // Auto-hide after 5 minutes
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 300000);

      return () => clearTimeout(timeout);
    }
  }, [isPrayerTime, currentPrayer, settings, hasShownForCurrentPrayer]);

  // Reset shown prayer when prayer time ends
  useEffect(() => {
    if (!isPrayerTime) {
      setHasShownForCurrentPrayer(null);
    }
  }, [isPrayerTime]);

  if (!isVisible || !currentPrayer) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center">
      <div className="relative max-w-md w-full mx-4 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-2 border-emerald-500/30 rounded-2xl p-8 text-center">
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
        >
          <X size={18} />
        </button>

        {/* Adhan icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
          <Mic className="w-10 h-10 text-emerald-400" />
        </div>

        {/* Prayer name */}
        <h2 className="text-3xl font-bold text-white mb-3">
          {currentPrayer} Time
        </h2>

        {/* Message */}
        <p className="text-emerald-200 text-lg mb-6">
          It's time for {currentPrayer} prayer
        </p>

        <p className="text-gray-300 text-sm">
          Videos have been paused automatically
        </p>

        {/* Dismiss button */}
        <button
          onClick={() => setIsVisible(false)}
          className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition"
        >
          Continue Watching
        </button>
      </div>
    </div>
  );
}
