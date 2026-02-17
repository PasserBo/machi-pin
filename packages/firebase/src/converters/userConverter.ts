import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  DocumentData,
  SnapshotOptions,
} from 'firebase/firestore';
import type { User } from '@repo/types';

/**
 * Converts between the Firestore /users/{uid} document and the `User` domain type.
 *
 * Firestore stores `uid` as the identifier field, while the domain model uses `id`.
 * Timestamps are stored as Firestore Timestamps and converted to JS Dates.
 */
export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user: User): DocumentData {
    return {
      uid: user.id,
      email: user.email,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions,
  ): User {
    const data = snapshot.data(options);
    return {
      id: (data.uid as string) || snapshot.id,
      email: (data.email as string) ?? '',
      displayName: (data.displayName as string) ?? undefined,
      photoURL: (data.photoURL as string) ?? undefined,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};

/** Safely converts a Firestore Timestamp or Date to a JS Date. */
function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date();
}
