import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  DocumentData,
  SnapshotOptions,
} from 'firebase/firestore';
import type { MapDocument } from '@repo/types';

/**
 * Firestore Data Converter for /maps/{mapId} documents.
 *
 * `fromFirestore` always attaches `id` from the snapshot so the returned
 * object is a fully-hydrated `MapDocument & { id: string }`.
 */
export const mapConverter: FirestoreDataConverter<MapDocument & { id: string }> = {
  toFirestore(map: MapDocument & { id: string }): DocumentData {
    // Omit `id` — it lives on the document path, not inside the document.
    const { id: _id, ...rest } = map;
    return rest;
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions,
  ): MapDocument & { id: string } {
    const d = snapshot.data(options);
    return {
      id: snapshot.id,
      name: d.name ?? '',
      ownerUid: d.ownerUid ?? '',
      styleKey: d.styleKey ?? '',
      styleUrl: d.styleUrl ?? '',
      thumbnailUrl: d.thumbnailUrl ?? undefined,
      boundingBox: d.boundingBox ?? { north: 0, south: 0, east: 0, west: 0 },
      center: d.center ?? { lat: 0, lng: 0 },
      zoom: d.zoom ?? 1,
      pinCount: d.pinCount ?? 0,
      createdAt: d.createdAt, // kept as Firestore Timestamp for the type
      updatedAt: d.updatedAt,
    };
  },
};
