import type { User as FirebaseUser } from 'firebase/auth';
import {
  getUserById,
  createUser,
  updateUser,
} from '@repo/firebase/repositories';
import type { User } from '@repo/types';

/**
 * Sync a Firebase Auth user to the Firestore users collection.
 *
 * - If a document already exists → return it.
 * - Otherwise → create a new one and return the optimistic result.
 */
export async function syncUser(fbUser: FirebaseUser): Promise<User> {
  const existing = await getUserById(fbUser.uid);
  if (existing) return existing;

  return createUser(fbUser.uid, {
    email: fbUser.email || '',
    displayName: fbUser.displayName || 'Anonymous',
    photoURL: fbUser.photoURL ?? undefined,
  });
}

/**
 * Create a brand-new user document (e.g. after email sign-up).
 */
export async function registerUser(
  uid: string,
  data: { email: string; displayName?: string },
): Promise<User> {
  return createUser(uid, {
    email: data.email,
    displayName: data.displayName,
    photoURL: undefined,
  });
}

export { updateUser };
export type { User };
