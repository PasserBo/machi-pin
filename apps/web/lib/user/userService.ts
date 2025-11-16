import type { User } from '@repo/types';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, 'uid' | 'createdAt'>>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserDisplayName(
  userId: string,
  displayName: string
): Promise<void> {
  await updateUserProfile(userId, { displayName });
}

export async function updateUserPhotoURL(
  userId: string,
  photoURL: string
): Promise<void> {
  await updateUserProfile(userId, { photoURL });
}

