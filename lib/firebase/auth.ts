'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';

export async function signUp(email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create account');
  }
}

export async function signIn(email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    // Clear session cookie
    await fetch('/api/auth/signout', { method: 'POST' });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
