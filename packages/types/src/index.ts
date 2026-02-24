// Core data models for Machi-Pin

/**
 * User data model
 */
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Map (collection of pins) data model - Legacy
 */
export interface Map {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  pinCount: number;
}

/**
 * Bounding box for map viewport
 */
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Center point coordinates
 */
export interface CenterPoint {
  lat: number;
  lng: number;
}

/**
 * MapDocument - Firestore document structure for maps
 * Used for storing map data with viewport information
 */
export interface MapDocument {
  id?: string;              // Firestore Doc ID (optional, added after creation)
  name: string;             // 地图名称 (用户输入)
  ownerUid: string;         // 创建者的 UID
  
  // 地图视觉数据
  styleKey: string;         // Map style key (e.g., 'basic', 'streets')
  styleUrl: string;         // Maptiler 的完整样式 URL
  thumbnailUrl?: string;    // (可选) 未来用于显示缩略图
  
  // 地图视口数据 (用于恢复视图)
  boundingBox: BoundingBox; // 存储为纯数字，方便查询
  center: CenterPoint;      // 中心点 (备用)
  zoom: number;             // 缩放层级 (备用)
  
  // Pin 统计
  pinCount: number;         // Pin 数量
  
  // 元数据
  createdAt: unknown;       // Firestore Timestamp
  updatedAt: unknown;       // Firestore Timestamp
}

/**
 * Create MapDocument input (for form submission)
 */
export type CreateMapDocumentInput = Omit<MapDocument, 'id' | 'createdAt' | 'updatedAt' | 'pinCount' | 'thumbnailUrl'>;

/**
 * GPS coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Sketch data (from Konva canvas)
 */
export interface Sketch {
  // JSON representation of Konva canvas state
  canvasData: string;
  // Optional thumbnail image URL
  thumbnailUrl?: string;
}

/**
 * Pin (a single memory/location) data model
 */
export interface Pin {
  id: string;
  mapId: string;
  userId: string;
  
  // Location
  coordinates: Coordinates;
  locationName?: string;
  address?: string;
  
  // Content
  title?: string;
  notes?: string;
  photoUrl?: string;
  sketch?: Sketch;
  
  // Metadata
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Tags/categories (optional)
  tags?: string[];
}

/**
 * Create Pin input (for form submission)
 */
export type CreatePinInput = Omit<Pin, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Create Map input (for form submission)
 */
export type CreateMapInput = Omit<Map, 'id' | 'createdAt' | 'updatedAt' | 'pinCount'>;

/**
 * Update Pin input (partial update)
 */
export type UpdatePinInput = Partial<Omit<Pin, 'id' | 'userId' | 'mapId' | 'createdAt'>>;

/**
 * Update Map input (partial update)
 */
export type UpdateMapInput = Partial<Omit<Map, 'id' | 'userId' | 'createdAt'>>;

/**
 * Pin color options
 */
export type PinColor = 'red' | 'blue' | 'yellow';

/**
 * Pin icon type options
 */
export type PinIconType = 'standard';

/**
 * PinDocument - Firestore document structure for pins
 * Used for storing pin data on maps
 */
export interface PinDocument {
  id?: string;                    // Firestore Doc ID (optional, added after creation)
  mapId: string;                  // Parent map ID
  ownerUid: string;               // Creator's UID
  
  // Location data
  location: {
    lat: number;
    lng: number;
  };
  
  // Visual style
  style: {
    color: PinColor;              // Pin color (red, blue, yellow)
    iconType: PinIconType;        // Icon type (currently only 'standard')
  };

  // Polaroid references (stacking order: last = top)
  attachedPolaroidIds?: string[];
  
  // Metadata
  createdAt: unknown;             // Firestore Timestamp
  updatedAt?: unknown;            // Firestore Timestamp
}

/**
 * Create PinDocument input (for form submission)
 */
export type CreatePinDocumentInput = Omit<PinDocument, 'id' | 'createdAt'>;

// ── Domain models (Pin with Polaroid support) ───────────────
export type { Pin as DomainPin, Polaroid } from './domain/map';

