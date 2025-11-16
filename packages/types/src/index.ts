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
 * Map (collection of pins) data model
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

