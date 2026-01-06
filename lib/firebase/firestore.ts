'use client';

import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from './config';

export interface VideoItem {
  id: string;
  type: 'video' | 'shorts';
  title?: string;
  thumbnail?: string;
  addedAt: Date | Timestamp;
  order: number;
}

export interface UserVideoList {
  userId: string;
  videos: VideoItem[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export async function getUserVideoList(userId: string): Promise<VideoItem[]> {
  try {
    const docRef = doc(db, 'videoLists', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserVideoList;
      // Convert Timestamps back to Dates for client use
      return (data.videos || []).map(video => ({
        ...video,
        addedAt: video.addedAt instanceof Timestamp ? video.addedAt.toDate() : video.addedAt,
      })).sort((a, b) => a.order - b.order);
    }
    return [];
  } catch (error) {
    console.error('Error fetching user video list:', error);
    return [];
  }
}

export async function createUserVideoList(userId: string, initialVideos: VideoItem[] = []): Promise<void> {
  try {
    const docRef = doc(db, 'videoLists', userId);
    
    // Convert Date objects to Timestamps for Firestore
    const videosWithTimestamps = initialVideos.map(video => ({
      ...video,
      addedAt: video.addedAt instanceof Date ? Timestamp.fromDate(video.addedAt) : video.addedAt,
    }));

    await setDoc(docRef, {
      userId,
      videos: videosWithTimestamps,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error('Error creating user video list:', error);
    throw error;
  }
}

export async function addVideoToUserList(userId: string, video: Omit<VideoItem, 'addedAt' | 'order'>): Promise<void> {
  try {
    const docRef = doc(db, 'videoLists', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Create new list if doesn't exist
      await createUserVideoList(userId, [{
        ...video,
        addedAt: new Date(),
        order: 0,
      }]);
      return;
    }

    const currentList = docSnap.data() as UserVideoList;
    const nextOrder = currentList.videos ? currentList.videos.length : 0;

    // Use Timestamp for Firestore consistency
    const newVideo = {
      ...video,
      addedAt: Timestamp.fromDate(new Date()),
      order: nextOrder,
    };

    await updateDoc(docRef, {
      videos: arrayUnion(newVideo),
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } catch (error) {
    console.error('Error adding video to user list:', error);
    throw error;
  }
}
