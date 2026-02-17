import { z } from 'zod';

const boundingBoxSchema = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
});

const centerPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

/**
 * Firestore document shape for /maps/{mapId}
 */
export const mapDocSchema = z.object({
  name: z.string().min(1),
  ownerUid: z.string().min(1),
  styleKey: z.string(),
  styleUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  boundingBox: boundingBoxSchema,
  center: centerPointSchema,
  zoom: z.number(),
  pinCount: z.number().int().nonnegative(),
  createdAt: z.unknown(), // Firestore Timestamp | FieldValue
  updatedAt: z.unknown(),
});

/** Validates input before creating a new map doc */
export const createMapInputSchema = z.object({
  name: z.string().min(1, 'Map name is required'),
  ownerUid: z.string().min(1),
  styleKey: z.string(),
  styleUrl: z.string().url(),
  boundingBox: boundingBoxSchema,
  center: centerPointSchema,
  zoom: z.number(),
});

export type MapDocData = z.infer<typeof mapDocSchema>;
export type CreateMapInput = z.infer<typeof createMapInputSchema>;
