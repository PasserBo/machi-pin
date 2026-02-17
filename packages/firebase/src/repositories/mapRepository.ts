import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import type { MapDocument } from '@repo/types';
import { db } from '../client';
import { mapConverter } from '../converters/mapConverter';
import type { CreateMapInput } from '../schema/map';

const COLLECTION = 'maps';

/** Hydrated MapDocument with guaranteed `id` */
export type MapWithId = MapDocument & { id: string };

function mapsCol() {
  return collection(db, COLLECTION).withConverter(mapConverter);
}

function mapRef(mapId: string) {
  return doc(db, COLLECTION, mapId).withConverter(mapConverter);
}

/** Fetch a single map by ID. Returns `null` if not found. */
export async function getMapById(mapId: string): Promise<MapWithId | null> {
  const snap = await getDoc(mapRef(mapId));
  return snap.exists() ? snap.data() : null;
}

/** List all maps owned by a given user, newest first. */
export async function listMapsByOwner(ownerUid: string): Promise<MapWithId[]> {
  const q = query(
    mapsCol(),
    where('ownerUid', '==', ownerUid),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data());
}

/**
 * Create a new map document.
 * Returns the generated Firestore document ID.
 */
export async function createMap(input: CreateMapInput): Promise<string> {
  // Write raw data (bypass converter) to use serverTimestamp()
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    pinCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Atomically adjust a map's pinCount by `delta` (usually +1 or -1). */
export async function adjustPinCount(
  mapId: string,
  delta: number,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, mapId), {
    pinCount: increment(delta),
    updatedAt: serverTimestamp(),
  });
}
