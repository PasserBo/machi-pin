import { z } from 'zod';

export const pinColorSchema = z.enum(['red', 'blue', 'yellow']);
export const pinIconTypeSchema = z.enum(['standard']);

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const styleSchema = z.object({
  color: pinColorSchema,
  iconType: pinIconTypeSchema,
});

/**
 * Firestore document shape for /maps/{mapId}/pins/{pinId}
 */
export const pinDocSchema = z.object({
  mapId: z.string().min(1),
  ownerUid: z.string().min(1),
  location: locationSchema,
  style: styleSchema,
  createdAt: z.unknown(), // Firestore Timestamp | FieldValue
});

/** Validates input before creating a new pin doc */
export const createPinInputSchema = z.object({
  mapId: z.string().min(1),
  ownerUid: z.string().min(1),
  location: locationSchema,
  style: styleSchema,
});

export type PinDocData = z.infer<typeof pinDocSchema>;
export type CreatePinInput = z.infer<typeof createPinInputSchema>;
