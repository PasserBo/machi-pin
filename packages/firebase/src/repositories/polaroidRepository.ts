import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  documentId
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../client.js';
import type { Polaroid } from '@repo/types';

/** Data required to create a Polaroid document (without auto-generated fields). */
export interface CreatePolaroidData {
  mapId: string;
  ownerUid: string;
  type?: 'default';
  photoUrl?: string;
  storagePath?: string;
  memo?: string;
  exifLocation?: { lat: number; lng: number };
}

/**
 * Upload a photo file to Firebase Storage.
 *
 * Path strategy: `users/{uid}/maps/{mapId}/polaroids/{timestamp}_{filename}`
 *
 * @returns `{ url, path }` — download URL and storage path (for later deletion).
 */
export async function uploadPolaroidPhoto(
  userId: string,
  mapId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  const storagePath = `users/${userId}/maps/${mapId}/polaroids/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, path: storagePath };
}

/**
 * Create a new Polaroid document in the `maps/{mapId}/polaroids` subcollection.
 *
 * @returns The generated Firestore document ID.
 */
export async function createPolaroid(data: CreatePolaroidData): Promise<string> {
  const docRef = await addDoc(collection(db, 'maps', data.mapId, 'polaroids'), {
    mapId: data.mapId,
    ownerUid: data.ownerUid,
    type: data.type ?? 'default',
    ...(data.photoUrl && { photoUrl: data.photoUrl }),
    ...(data.storagePath && { storagePath: data.storagePath }),
    ...(data.memo && { memo: data.memo }),
    ...(data.exifLocation && { exifLocation: data.exifLocation }),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
/**
 * 核心通路 1：通过 ID 获取单张拍立得
 */
export async function getPolaroid(mapId: string, polaroidId: string): Promise<Polaroid | null> {
  if (!mapId || !polaroidId) return null;

  const docRef = doc(db, 'maps', mapId, 'polaroids', polaroidId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  // 转换为 Domain 对象 (注意时间戳和 GeoPoint 的转换)
  return {
    id: snapshot.id,
    mapId: data.mapId,
    ownerUid: data.ownerUid,
    type: data.type,
    photoUrl: data.photoUrl,
    storagePath: data.storagePath,
    memo: data.memo,
    exifLocation: data.exifLocation 
      ? { lat: data.exifLocation.latitude, lng: data.exifLocation.longitude } 
      : undefined,
    createdAt: data.createdAt?.toMillis() || Date.now(),
  } as Polaroid;
}

/**
 * 核心通路 2：通过 ID 数组批量获取拍立得 (用于读取 Pin 挂载的所有内容)
 */
export async function getPolaroidsByIds(mapId: string, polaroidIds: string[]): Promise<Polaroid[]> {
  if (!mapId || !polaroidIds || polaroidIds.length === 0) {
    return [];
  }

  // Firestore 的 'in' 查询限制最多 10 个元素。
  // 如果你的产品设定一个 Pin 最多钉 10 张照片，直接用 'in' 查询最高效：
  if (polaroidIds.length <= 10) {
    const polaroidsRef = collection(db, 'maps', mapId, 'polaroids');
    const q = query(polaroidsRef, where(documentId(), 'in', polaroidIds));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // ... 同上的转换逻辑 ...
        mapId: data.mapId,
        ownerUid: data.ownerUid,
        type: data.type,
        photoUrl: data.photoUrl,
        storagePath: data.storagePath,
        memo: data.memo,
        createdAt: data.createdAt?.toMillis() || Date.now(),
      } as Polaroid;
    });
  } else {
    // 如果产品允许一个 Pin 挂超过 10 张（极端情况），则降级使用 Promise.all 并发单体读取
    const promises = polaroidIds.map(id => getPolaroid(mapId, id));
    const results = await Promise.all(promises);
    return results.filter((p): p is Polaroid => p !== null);
  }
}