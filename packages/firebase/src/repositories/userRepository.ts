import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { User } from '@repo/types';
import { db } from '../client';
import { userConverter } from '../converters/userConverter';

const COLLECTION = 'users';

function userRef(uid: string) {
  return doc(db, COLLECTION, uid).withConverter(userConverter);
}

/** Fetch a user by UID. Returns `null` if not found. */
export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Create (or overwrite) the user document.
 * Typically called on first sign-in to sync Firebase Auth → Firestore.
 */
export async function createUser(
  uid: string,
  data: { email: string; displayName?: string; photoURL?: string | null },
): Promise<User> {
  const now = new Date();
  // Write the raw Firestore fields (not through the converter) so we can
  // use serverTimestamp() for accurate server-side time.
  await setDoc(doc(db, COLLECTION, uid), {
    uid,
    email: data.email,
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Return a domain User immediately (optimistic)
  return {
    id: uid,
    email: data.email,
    displayName: data.displayName ?? undefined,
    photoURL: data.photoURL ?? undefined,
    createdAt: now,
    updatedAt: now,
  };
}

/** Partial update of a user document. */
export async function updateUser(
  uid: string,
  updates: Partial<Pick<User, 'displayName' | 'photoURL' | 'email'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
