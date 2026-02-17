import { z } from 'zod';

/**
 * Firestore document shape for /users/{uid}
 *
 * In Firestore the document stores `uid` (the Auth UID), while the domain
 * model (`@repo/types → User`) uses `id`.  The converter handles the mapping.
 */
export const userDocSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().nullable().optional(),
  createdAt: z.unknown(), // Firestore Timestamp | FieldValue
  updatedAt: z.unknown(),
});

/** Validates user input before creating a new user doc */
export const createUserInputSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().nullable().optional(),
});

export type UserDocData = z.infer<typeof userDocSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
