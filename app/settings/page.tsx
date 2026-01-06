'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import {
  getPrayerTimeSettings,
  savePrayerTimeSettings,
  getUserLocation,
  fetchPrayerTimes,
  PrayerTimeSettings,
  PrayerTimes,
} from '@/lib/firebase/prayer-times';
import {
  getScreenTimeLimits,
  saveScreenTimeLimits,
  getTodayScreenTimeUsage,
  ScreenTimeLimit,
  ScreenTimeUsage,
} from '@/lib/firebase/screen-time';
import { Bell, MapPin, Settings as SettingsIcon, Save, Clock, Plus, Trash2 } from 'lucide-react';

type TabType = 'prayer' | 'screentime';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('prayer');
  
  // Prayer time state
  const [prayerSettings, setPrayerSettings] = useState<PrayerTimeSettings | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  
  // Screen time state
  const [screenTimeSettings, setScreenTimeSettings] = useState<ScreenTimeLimit | null>(null);
  const [todayUsage, setTodayUsage] = useState<ScreenTimeUsage | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadAllSettings();
    }
  }, [user, loading, router]);

  async function loadAllSettings() {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load prayer settings
      const userPrayerSettings = await getPrayerTimeSettings(user.uid);

      if (userPrayerSettings) {
        setPrayerSettings(userPrayerSettings);
        // Load prayer times preview
        const times = await fetchPrayerTimes(
          userPrayerSettings.latitude,
          userPrayerSettings.longitude,
          userPrayerSettings.method,
          userPrayerSettings.school
        );
        setPrayerTimes(times);
      } else {
        // Initialize with defaults
        setPrayerSettings({
          userId: user.uid,
          latitude: 0,
          longitude: 0,
          method: 2, // ISNA
          school: 0, // Shafi
          enabled: false,
          pauseVideos: true,
          playAdhan: true,
          updatedAt: new Date(),
        });
      }
      
      // Load screen time settings
      const screenLimits = await getScreenTimeLimits(user.uid);
      if (screenLimits) {
        setScreenTimeSettings(screenLimits);
      } else {
        // Initialize with defaults
        setScreenTimeSettings({
          userId: user.uid,
          dailyLimitMinutes: 60,
          enabled: false,
          schedules: [],
          lockMessage: 'Daily screen time limit reached. Come back tomorrow!',
          updatedAt: new Date(),
        });
      }
      
      // Load today's usage
      const usage = await getTodayScreenTimeUsage(user.uid);
      setTodayUsage(usage);
    } catch (error) {
      console.error('Failed to load settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }
          method: 2, // ISNA
          school: 0, // Shafi
          enabled: false,
          pauseVideos: true,
          playAdhan: true,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGetLocation() {
    setIsLoading(true);
    try {
      const location = await getUserLocation();

      if (location && settings) {
        const updatedSettings = {
          ...settings,
          latitude: location.latitude,
          longitude: location.longitude,
        };
        setSettings(updatedSettings);

        // Load prayer times for new location
        const times = await fetchPrayerTimes(
          location.latitude,
          location.longitude,
          settings.method,
          settings.school
        );
        setPrayerTimes(times);
        showMessage('success', 'Location updated successfully');
      } else {
        showMessage('error', 'Failed to get location. Please enable location access.');
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      showMessage('error', 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveSettings() {
    if (!settings) return;

    setIsSaving(true);
    try {
      await savePrayerTimeSettings(settings);
      showMessage('success', 'Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  function updateSetting<K extends keyof PrayerTimeSettings>(key: K, value: PrayerTimeSettings[K]) {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white text-lg">Loading settings...</div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20">
      <Header />

      <div className="pt-[60px] px-4 max-w-2xl mx-auto">
        {/* Page Title */}
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SettingsIcon size={28} />
            Prayer Time Settings
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure Adhan notifications and video pause behavior
          </p>
        </div>

        {/* Message Toast */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Enable Prayer Times */}
          <div className="bg-[#272727] rounded-lg p-6">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="text-emerald-500" size={24} />
                <div>
                  <h3 className="text-white font-semibold">Enable Prayer Time Notifications</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Pause videos and play Adhan at prayer times
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => updateSetting('enabled', e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          {/* Location Settings */}
          <div className="bg-[#272727] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-blue-500" size={24} />
              <div>
                <h3 className="text-white font-semibold">Location</h3>
                <p className="text-gray-400 text-sm mt-1">Used to calculate prayer times</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400 w-24">Latitude:</span>
                <span className="text-white">{settings.latitude.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400 w-24">Longitude:</span>
                <span className="text-white">{settings.longitude.toFixed(4)}</span>
              </div>

              <button
                onClick={handleGetLocation}
                disabled={isLoading}
                className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition"
              >
                {isLoading ? 'Getting Location...' : 'Update Location'}
              </button>
            </div>
          </div>

          {/* Calculation Method */}
          <div className="bg-[#272727] rounded-lg p-6">
            <h3 className="text-white font-semibold mb-3">Calculation Method</h3>
            <select
              value={settings.method}
              onChange={(e) => updateSetting('method', parseInt(e.target.value))}
              className="w-full p-3 bg-[#0f0f0f] text-white rounded-lg border border-gray-600"
            >
              <option value={2}>ISNA (Islamic Society of North America)</option>
              <option value={1}>University of Islamic Sciences, Karachi</option>
              <option value={3}>Muslim World League</option>
              <option value={4}>Umm Al-Qura University, Makkah</option>
              <option value={5}>Egyptian General Authority of Survey</option>
            </select>
          </div>

          {/* School/Madhab */}
          <div className="bg-[#272727] rounded-lg p-6">
            <h3 className="text-white font-semibold mb-3">School (Madhab)</h3>
            <select
              value={settings.school}
              onChange={(e) => updateSetting('school', parseInt(e.target.value))}
              className="w-full p-3 bg-[#0f0f0f] text-white rounded-lg border border-gray-600"
            >
              <option value={0}>Shafi, Maliki, Hanbali, Ja'fari</option>
              <option value={1}>Hanafi</option>
            </select>
          </div>

          {/* Behavior Settings */}
          <div className="bg-[#272727] rounded-lg p-6 space-y-4">
            <h3 className="text-white font-semibold mb-3">Behavior</h3>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Pause videos during prayer time</span>
              <input
                type="checkbox"
                checked={settings.pauseVideos}
                onChange={(e) => updateSetting('pauseVideos', e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Play Adhan sound</span>
              <input
                type="checkbox"
                checked={settings.playAdhan}
                onChange={(e) => updateSetting('playAdhan', e.target.checked)}
                className="w-5 h-5 rounded"
              />
            </label>
          </div>

          {/* Prayer Times Preview */}
          {prayerTimes && (
            <div className="bg-[#272727] rounded-lg p-6">
              <h3 className="text-white font-semibold mb-3">Today's Prayer Times</h3>
              <p className="text-gray-400 text-sm mb-4">{prayerTimes.date}</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(prayerTimes)
                  .filter(([key]) => key !== 'date' && key !== 'Sunrise')
                  .map(([name, time]) => (
                    <div key={name} className="flex justify-between items-center p-3 bg-[#0f0f0f] rounded-lg">
                      <span className="text-gray-300">{name}</span>
                      <span className="text-white font-mono">{time}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
