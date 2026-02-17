import {
  getMapById,
  createMap as baseCreateMap,
  createPin as baseCreatePin,
  adjustPinCount,
  subscribePins as baseSubscribePins,
  type MapWithId,
  type PinWithId,
} from '@repo/firebase/repositories';
import type { PinColor, PinIconType } from '@repo/types';
import type { Unsubscribe } from 'firebase/firestore';

// ── Map Reads ───────────────────────────────────────────────

/** Fetch a single map by ID. Returns `null` if not found. */
export async function fetchMap(mapId: string): Promise<MapWithId | null> {
  return getMapById(mapId);
}

// ── Map Writes ──────────────────────────────────────────────

export interface CreateMapParams {
  name: string;
  ownerUid: string;
  styleKey: string;
  styleUrl: string;
  boundingBox: { north: number; south: number; east: number; west: number };
  center: { lat: number; lng: number };
  zoom: number;
}

/** Create a new map document. Returns the Firestore doc ID. */
export async function createMap(params: CreateMapParams): Promise<string> {
  return baseCreateMap(params);
}

// ── Pin on Map (aggregated operations) ──────────────────────

export interface DropPinParams {
  mapId: string;
  ownerUid: string;
  location: { lat: number; lng: number };
  color: PinColor;
  iconType?: PinIconType;
}

/**
 * Drop a pin onto the map.
 *
 * This is an **aggregated write**: it creates the pin document in the
 * subcollection AND atomically increments the parent map's `pinCount`.
 */
export async function dropPinOnMap(params: DropPinParams): Promise<string> {
  const pinId = await baseCreatePin({
    mapId: params.mapId,
    ownerUid: params.ownerUid,
    location: params.location,
    style: {
      color: params.color,
      iconType: params.iconType ?? 'standard',
    },
  });

  await adjustPinCount(params.mapId, 1);

  return pinId;
}

// ── Pin Subscription ────────────────────────────────────────

/**
 * Subscribe to all pins for a given map in real-time.
 *
 * Returns an `Unsubscribe` function.
 */
export function subscribeToPins(
  mapId: string,
  onData: (pins: PinWithId[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return baseSubscribePins(mapId, onData, onError);
}

// ── Re-exports for presentation layer ───────────────────────

export type { MapWithId, PinWithId };
