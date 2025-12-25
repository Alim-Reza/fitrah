'use client';

import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from './config';

export interface VideoItem {
  id: string;
  type: 'video' | 'shorts';
  title?: string;
  thumbnail?: string;
  addedAt: Date;
  order: number;
}

export interface UserVideoList {
  userId: string;
  videos: VideoItem[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserVideoList(userId: string): Promise<VideoItem[]> {
  try {
    const docRef = doc(db, 'videoLists', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserVideoList;
      return data.videos || [];
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
    await setDoc(docRef, {
      userId,
      videos: initialVideos,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    const nextOrder = currentList.videos.length;

    await updateDoc(docRef, {
      videos: arrayUnion({
        ...video,
        addedAt: new Date(),
        order: nextOrder,
      }),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error adding video to user list:', error);
    throw error;
  }
}
