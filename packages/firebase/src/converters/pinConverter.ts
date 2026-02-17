import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  DocumentData,
  SnapshotOptions,
} from 'firebase/firestore';
import type { PinDocument } from '@repo/types';

/**
 * Firestore Data Converter for /maps/{mapId}/pins/{pinId} documents.
 *
 * `fromFirestore` attaches `id` from the snapshot so the returned object
 * is a fully-hydrated `PinDocument & { id: string }`.
 */
export const pinConverter: FirestoreDataConverter<PinDocument & { id: string }> = {
  toFirestore(pin: PinDocument & { id: string }): DocumentData {
    const { id: _id, ...rest } = pin;
    return rest;
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions,
  ): PinDocument & { id: string } {
    const d = snapshot.data(options);
    return {
      id: snapshot.id,
      mapId: d.mapId ?? '',
      ownerUid: d.ownerUid ?? '',
      location: d.location ?? { lat: 0, lng: 0 },
      style: d.style ?? { color: 'red', iconType: 'standard' },
      createdAt: d.createdAt,
    };
  },
};
