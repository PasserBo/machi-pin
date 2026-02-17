import { listMapsByOwner, type MapWithId } from '@repo/firebase/repositories';

/**
 * Fetch all maps belonging to the current user, ordered by newest first.
 */
export async function fetchUserMaps(ownerUid: string): Promise<MapWithId[]> {
  return listMapsByOwner(ownerUid);
}

export type { MapWithId };
