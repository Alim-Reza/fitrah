'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  orderBy, 
  limit,
  getDocs,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from './config';

export interface WatchHistoryItem {
  videoId: string;
  type: 'video' | 'shorts';
  watchedAt: Date;
  watchDuration: number; // seconds
  completed: boolean;
  title?: string;
  thumbnail?: string;
}

export interface WatchSession {
  userId: string;
  videoId: string;
  type: 'video' | 'shorts';
  startedAt: Date;
  lastUpdated: Date;
  watchDuration: number;
  completed: boolean;
}

/**
 * Record or update a watch session
 */
export async function recordWatchSession(
  userId: string,
  videoId: string,
  type: 'video' | 'shorts',
  watchDuration: number,
  completed: boolean = false
): Promise<void> {
  try {
    const sessionId = `${videoId}_${new Date().toISOString().split('T')[0]}`;
    const docRef = doc(db, 'watchHistory', userId, 'sessions', sessionId);
    
    const existingDoc = await getDoc(docRef);
    
    if (existingDoc.exists()) {
      // Update existing session
      await setDoc(docRef, {
        userId,
        videoId,
        type,
        lastUpdated: new Date(),
        watchDuration,
        completed,
      }, { merge: true });
    } else {
      // Create new session
      await setDoc(docRef, {
        userId,
        videoId,
        type,
        startedAt: new Date(),
        lastUpdated: new Date(),
        watchDuration,
        completed,
      });
    }
  } catch (error) {
    console.error('Error recording watch session:', error);
    throw error;
  }
}

/**
 * Get user's watch history
 */
export async function getWatchHistory(
  userId: string,
  limitCount: number = 50
): Promise<WatchHistoryItem[]> {
  try {
    const sessionsRef = collection(db, 'watchHistory', userId, 'sessions');
    const q = query(sessionsRef, orderBy('lastUpdated', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const history: WatchHistoryItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as WatchSession;
      history.push({
        videoId: data.videoId,
        type: data.type,
        watchedAt: data.lastUpdated,
        watchDuration: data.watchDuration,
        completed: data.completed,
      });
    });
    
    return history;
  } catch (error) {
    console.error('Error fetching watch history:', error);
    return [];
  }
}

/**
 * Get watch statistics for today
 */
export async function getTodayWatchTime(userId: string): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sessionsRef = collection(db, 'watchHistory', userId, 'sessions');
    const q = query(
      sessionsRef,
      where('lastUpdated', '>=', today),
      orderBy('lastUpdated', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    let totalSeconds = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data() as WatchSession;
      totalSeconds += data.watchDuration;
    });
    
    return totalSeconds;
  } catch (error) {
    console.error('Error fetching today watch time:', error);
    return 0;
  }
}

/**
 * Get most watched videos
 */
export async function getMostWatchedVideos(
  userId: string,
  limitCount: number = 10
): Promise<Array<{ videoId: string; type: 'video' | 'shorts'; totalWatchTime: number }>> {
  try {
    const sessionsRef = collection(db, 'watchHistory', userId, 'sessions');
    const q = query(sessionsRef, orderBy('watchDuration', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const videoMap = new Map<string, { type: 'video' | 'shorts'; totalTime: number }>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as WatchSession;
      const existing = videoMap.get(data.videoId);
      
      if (existing) {
        existing.totalTime += data.watchDuration;
      } else {
        videoMap.set(data.videoId, {
          type: data.type,
          totalTime: data.watchDuration,
        });
      }
    });
    
    return Array.from(videoMap.entries())
      .map(([videoId, data]) => ({
        videoId,
        type: data.type,
        totalWatchTime: data.totalTime,
      }))
      .sort((a, b) => b.totalWatchTime - a.totalWatchTime)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching most watched videos:', error);
    return [];
  }
}
