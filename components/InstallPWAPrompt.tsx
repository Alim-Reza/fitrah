'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedDate = dismissed ? parseInt(dismissed) : 0;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    // If dismissed less than 7 days ago, don't show
    if (dismissedDate && Date.now() - dismissedDate < sevenDays) {
      return;
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 3 seconds delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    // Save dismissal timestamp
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
      
      {/* Popup */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300 md:bottom-8 md:left-1/2 md:-translate-x-1/2 md:max-w-md md:rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-gray-900 to-black border-t md:border border-gray-800 shadow-2xl">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <div className="p-6 pt-8">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Download size={32} className="text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-white text-xl font-bold mb-2">
                Install Parental Choice
              </h3>
              <p className="text-gray-300 text-sm">
                Get quick access to your favorite videos! Install our app for a better experience:
              </p>
              <ul className="text-gray-400 text-xs mt-3 space-y-1">
                <li>✓ Works offline</li>
                <li>✓ Faster loading</li>
                <li>✓ Home screen access</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition"
              >
                Not Now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition shadow-lg"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
