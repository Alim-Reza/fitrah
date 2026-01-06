'use client';

import { 
  doc, 
  getDoc, 
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';

export interface ScreenTimeLimit {
  userId: string;
  dailyLimitMinutes: number;
  enabled: boolean;
  schedules: ScreenTimeSchedule[];
  lockMessage?: string;
  requirePassword: boolean;
  parentPassword?: string;
  consecutiveShortsLimit: number;
  updatedAt: Date;
}

export interface ScreenTimeSchedule {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  daysOfWeek: number[]; // 0 = Sunday, 6 = Saturday
  action: 'block' | 'limit'; // block = no videos, limit = apply daily limit
}

export interface ScreenTimeUsage {
  userId: string;
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  lastUpdated: Date;
}

/**
 * Get screen time limit settings
 */
export async function getScreenTimeLimits(userId: string): Promise<ScreenTimeLimit | null> {
  try {
    const docRef = doc(db, 'screenTimeLimits', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ScreenTimeLimit;
    }
    return null;
  } catch (error) {
    console.error('Error fetching screen time limits:', error);
    return null;
  }
}

/**
 * Save screen time limit settings
 */
export async function saveScreenTimeLimits(limits: ScreenTimeLimit): Promise<void> {
  try {
    const docRef = doc(db, 'screenTimeLimits', limits.userId);
    await setDoc(docRef, {
      ...limits,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving screen time limits:', error);
    throw error;
  }
}

/**
 * Get today's screen time usage
 */
export async function getTodayScreenTimeUsage(userId: string): Promise<ScreenTimeUsage> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'screenTimeUsage', userId, 'daily', today);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ScreenTimeUsage;
    }
    
    // Return empty usage
    return {
      userId,
      date: today,
      totalMinutes: 0,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching screen time usage:', error);
    return {
      userId,
      date: new Date().toISOString().split('T')[0],
      totalMinutes: 0,
      lastUpdated: new Date(),
    };
  }
}

/**
 * Update screen time usage (add minutes)
 */
export async function updateScreenTimeUsage(userId: string, additionalMinutes: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'screenTimeUsage', userId, 'daily', today);
    const docSnap = await getDoc(docRef);
    
    let currentMinutes = 0;
    if (docSnap.exists()) {
      currentMinutes = (docSnap.data() as ScreenTimeUsage).totalMinutes;
    }
    
    await setDoc(docRef, {
      userId,
      date: today,
      totalMinutes: currentMinutes + additionalMinutes,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error updating screen time usage:', error);
    throw error;
  }
}

/**
 * Subscribe to screen time limit changes (for real-time updates)
 */
export function subscribeToScreenTimeLimits(
  userId: string,
  callback: (limits: ScreenTimeLimit | null) => void
): Unsubscribe {
  const docRef = doc(db, 'screenTimeLimits', userId);
  
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as ScreenTimeLimit);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to screen time limits:', error);
    callback(null);
  });
}

/**
 * Check if user is within an active schedule
 */
export function checkActiveSchedule(schedules: ScreenTimeSchedule[]): {
  isBlocked: boolean;
  isLimited: boolean;
  activeSchedule: ScreenTimeSchedule | null;
} {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  for (const schedule of schedules) {
    // Check if today is included in this schedule
    if (!schedule.daysOfWeek.includes(currentDay)) continue;
    
    // Parse start and end times
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    // Check if current time is within schedule
    let isInSchedule = false;
    if (endTime > startTime) {
      // Normal case: same day (e.g., 09:00 - 17:00)
      isInSchedule = currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight case (e.g., 22:00 - 06:00)
      isInSchedule = currentTime >= startTime || currentTime <= endTime;
    }
    
    if (isInSchedule) {
      return {
        isBlocked: schedule.action === 'block',
        isLimited: schedule.action === 'limit',
        activeSchedule: schedule,
      };
    }
  }
  
  return {
    isBlocked: false,
    isLimited: false,
    activeSchedule: null,
  };
}
