import {
  uploadPolaroidPhoto,
  createPolaroid,
  attachPolaroidToPin,
  getPolaroid as getPolaroidById,
} from '@repo/firebase/repositories';
import { db, storage } from '@repo/firebase/client';
import { deleteDoc, updateDoc, arrayRemove, doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import type { Polaroid } from '@repo/types';

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

export async function getPolaroid(mapId: string, polaroidId: string): Promise<Polaroid | null> {
  return getPolaroidById(mapId, polaroidId);
}

export async function deletePolaroid(
  mapId: string,
  pinId: string,
  polaroidId: string,
  storagePath?: string,
): Promise<void> {
  try {
    // (A) Delete photo object first (if any)
    if (storagePath) {
      try {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code !== 'storage/object-not-found') {
          throw error;
        }
      }
    }

    // (B) Unlink from Pin
    const pinRef = doc(db, 'maps', mapId, 'pins', pinId);
    await updateDoc(pinRef, {
      attachedPolaroidIds: arrayRemove(polaroidId),
    });

    // (C) Delete Polaroid document
    const polaroidRef = doc(db, 'maps', mapId, 'polaroids', polaroidId);
    await deleteDoc(polaroidRef);
  } catch (error) {
    console.error('Failed to delete polaroid:', error);
    throw error;
  }
}
