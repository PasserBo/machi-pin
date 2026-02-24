import {
  uploadPolaroidPhoto,
  createPolaroid,
  attachPolaroidToPin,
} from '@repo/firebase/repositories';

// ── Types ───────────────────────────────────────────────────

export interface CreatePolaroidParams {
  mapId: string;
  pinId: string;
  userId: string;
  file?: File;
  memo?: string;
  exifLocation?: { lat: number; lng: number };
}

// ── Core Business Operation ─────────────────────────────────

/**
 * Create a Polaroid and attach it to a Pin.
 *
 * Orchestration flow:
 *   1. Upload photo to Storage (if provided)
 *   2. Create Polaroid document in `maps/{mapId}/polaroids`
 *   3. Append the new Polaroid ID to the Pin's `attachedPolaroidIds`
 *
 * This is the **only** entry point for saving a Polaroid from the UI.
 */
export async function createPolaroidForPin(params: CreatePolaroidParams): Promise<string> {
  const { mapId, pinId, userId, file, memo, exifLocation } = params;

  let photoUrl: string | undefined;
  let storagePath: string | undefined;

  // 1. Upload photo if provided
  if (file) {
    const result = await uploadPolaroidPhoto(userId, mapId, file);
    photoUrl = result.url;
    storagePath = result.path;
  }

  // 2. Create Polaroid document
  const polaroidId = await createPolaroid({
    mapId,
    ownerUid: userId,
    type: 'default',
    photoUrl,
    storagePath,
    memo: memo || undefined,
    exifLocation,
  });

  // 3. Link Polaroid to Pin
  await attachPolaroidToPin(mapId, pinId, polaroidId);

  return polaroidId;
}
