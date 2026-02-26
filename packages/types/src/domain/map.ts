/**
 * Domain types for Map / Pin / Polaroid.
 *
 * IMPORTANT: This file must NOT import from firebase/firestore or any
 * infrastructure package. Domain types use only plain TS primitives.
 * The conversion between Firestore types (Timestamp, GeoPoint) and these
 * plain types is handled by converters in @repo/firebase.
 */

// 定义一个通用的地理位置接口，不依赖 Firebase
export interface ILocation {
    lat: number;
    lng: number;
  }
// ── Pin (地图上的物理图钉 — 锚点) ──────────────────────────

export interface Pin {
  id: string;
  mapId: string;
  ownerUid: string;

  /** 图钉在地图上的位置 (plain lat/lng, NOT GeoPoint) */
  location: ILocation;

  /** 挂载的拍立得卡片 ID 列表 (数组顺序 = 堆叠顺序, 最后 = 最上面) */
  attachedPolaroidIds: string[];

  style: {
    color: string;
    iconType: string;
  };

  createdAt: number; // Firestore Timestamp — kept opaque in domain layer
  updatedAt: number;
}

// ── Polaroid (内容卡片 — 拍立得) ────────────────────────────

export interface Polaroid {
  id: string;
  mapId: string;
  ownerUid: string;

  /** 卡片类型 (预留扩展) */
  type: 'default';

  /** 图片下载链接 */
  photoUrl?: string;
  /** Storage 中的路径 (用于删除) */
  storagePath?: string;
  /** 背面文字 */
  memo?: string;

  /** 如果照片有 Exif, 记录拍摄时的真实位置 (可能与 Pin 不同) */
  exifLocation?: ILocation;

  createdAt: unknown; // Firestore Timestamp
}
