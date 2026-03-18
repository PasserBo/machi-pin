import {
  listMapsByOwner,
  setMapVisibility as setMapVisibilityBase,
  type MapWithId,
} from '@repo/firebase/repositories';
import type { MapVisibility } from '@repo/types';

/**
 * Fetch all maps belonging to the current user, ordered by newest first.
 */
export async function fetchUserMaps(ownerUid: string): Promise<MapWithId[]> {
  return listMapsByOwner(ownerUid);
}

export async function setMapVisibility(
  mapId: string,
  visibility: MapVisibility,
): Promise<void> {
  await setMapVisibilityBase(mapId, visibility);
}

export type { MapWithId };
