import {
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  collection,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import type { PinDocument } from '@repo/types';
import { db } from '../client.js';
import { pinConverter } from '../converters/pinConverter.js';
import type { CreatePinInput } from '../schema/pin.js';

/** Hydrated PinDocument with guaranteed `id` */
export type PinWithId = PinDocument & { id: string };

function pinsCol(mapId: string) {
  return collection(db, 'maps', mapId, 'pins').withConverter(pinConverter);
}

/**
 * Create a new pin inside the /maps/{mapId}/pins subcollection.
 * Returns the generated document ID.
 */
export async function createPin(input: CreatePinInput): Promise<string> {
  const { mapId, ...rest } = input;
  // Write raw data (bypass converter) to use serverTimestamp()
  const docRef = await addDoc(collection(db, 'maps', mapId, 'pins'), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Subscribe to all pins for a given map in real-time.
 *
 * @param mapId   The parent map ID
 * @param onData  Called whenever the pin list changes
 * @param onError Called on subscription errors
 * @returns An `Unsubscribe` function to tear down the listener
 */
/**
 * Append a Polaroid ID to a pin's `attachedPolaroidIds` array.
 */
export async function attachPolaroidToPin(
  mapId: string,
  pinId: string,
  polaroidId: string,
): Promise<void> {
  const pinRef = doc(db, 'maps', mapId, 'pins', pinId);
  await updateDoc(pinRef, {
    attachedPolaroidIds: arrayUnion(polaroidId),
    updatedAt: serverTimestamp(),
  });
}

export function subscribePins(
  mapId: string,
  onData: (pins: PinWithId[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    pinsCol(mapId),
    (snapshot) => {
      const pins = snapshot.docs.map((d) => d.data());
      onData(pins);
    },
    (err) => {
      console.error('Pin subscription error:', err);
      onError?.(err);
    },
  );
}
