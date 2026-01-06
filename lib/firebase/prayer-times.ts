'use client';

import { 
  doc, 
  getDoc, 
  setDoc,
} from 'firebase/firestore';
import { db } from './config';

export interface PrayerTimeSettings {
  userId: string;
  latitude: number;
  longitude: number;
  method: number; // Calculation method (1-13, see Aladhan API)
  school: number; // Madhab/School (0 = Shafi, 1 = Hanafi)
  enabled: boolean;
  pauseVideos: boolean;
  playAdhan: boolean;
  updatedAt: Date;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  date: string;
}

/**
 * Get user's prayer time settings
 */
export async function getPrayerTimeSettings(userId: string): Promise<PrayerTimeSettings | null> {
  try {
    const docRef = doc(db, 'prayerSettings', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as PrayerTimeSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching prayer time settings:', error);
    return null;
  }
}

/**
 * Save user's prayer time settings
 */
export async function savePrayerTimeSettings(settings: PrayerTimeSettings): Promise<void> {
  try {
    const docRef = doc(db, 'prayerSettings', settings.userId);
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving prayer time settings:', error);
    throw error;
  }
}

/**
 * Fetch prayer times from Aladhan API
 */
export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  method: number = 2, // 2 = Islamic Society of North America (ISNA)
  school: number = 0   // 0 = Shafi
): Promise<PrayerTimes | null> {
  try {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    
    const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=${school}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      return {
        Fajr: data.data.timings.Fajr,
        Sunrise: data.data.timings.Sunrise,
        Dhuhr: data.data.timings.Dhuhr,
        Asr: data.data.timings.Asr,
        Maghrib: data.data.timings.Maghrib,
        Isha: data.data.timings.Isha,
        date: data.data.date.readable,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
}

/**
 * Get user's location using browser geolocation API
 */
export async function getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        resolve(null);
      }
    );
  });
}

/**
 * Check if current time is within prayer time window (±5 minutes)
 */
export function isWithinPrayerTime(prayerTimes: PrayerTimes): { isPrayerTime: boolean; currentPrayer: string | null } {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  
  for (const prayer of prayers) {
    const prayerTimeStr = prayerTimes[prayer as keyof PrayerTimes];
    const [hours, minutes] = prayerTimeStr.split(':').map(Number);
    const prayerTimeMinutes = hours * 60 + minutes;
    
    // Check if within ±5 minutes of prayer time
    const diff = Math.abs(currentTime - prayerTimeMinutes);
    if (diff <= 5) {
      return { isPrayerTime: true, currentPrayer: prayer };
    }
  }
  
  return { isPrayerTime: false, currentPrayer: null };
}
