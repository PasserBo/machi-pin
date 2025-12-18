'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import Map, { MapRef, ViewStateChangeEvent } from 'react-map-gl/maplibre';
import type { LngLatBounds } from 'maplibre-gl';

// Maptiler API key
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

// Available map styles
export const MAP_STYLES = {
  basic: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
  streets: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

// Default view state (Tokyo)
const DEFAULT_VIEW_STATE = {
  longitude: 139.6917,
  latitude: 35.6895,
  zoom: 12,
};

/**
 * Handle interface exposed to parent components
 */
export interface MapCanvasHandle {
  getBounds: () => LngLatBounds | undefined;
  getCenter: () => { lat: number; lng: number } | undefined;
  getZoom: () => number | undefined;
  getMap: () => maplibregl.Map | undefined;
}

interface MapCanvasProps {
  className?: string;
  mapStyle?: MapStyleKey;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  onMoveEnd?: (bounds: LngLatBounds) => void;
  /** Callback when map is ready, provides handle for parent to use */
  onMapReady?: (handle: MapCanvasHandle) => void;
}

export default function MapCanvas({
  className = '',
  mapStyle = 'basic',
  initialViewState,
  onMoveEnd,
  onMapReady,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(
    initialViewState || DEFAULT_VIEW_STATE
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Get the style URL based on the style key
  const styleUrl = MAP_STYLES[mapStyle];

  // Create the handle object
  const createHandle = useCallback((): MapCanvasHandle => ({
    getBounds: () => {
      return mapRef.current?.getMap()?.getBounds();
    },
    getCenter: () => {
      const center = mapRef.current?.getMap()?.getCenter();
      if (!center) return undefined;
      return { lat: center.lat, lng: center.lng };
    },
    getZoom: () => {
      return mapRef.current?.getMap()?.getZoom();
    },
    getMap: () => {
      return mapRef.current?.getMap();
    },
  }), []);

  // Notify parent when map is loaded
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    if (onMapReady) {
      onMapReady(createHandle());
    }
  }, [onMapReady, createHandle]);

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  const handleMoveEnd = useCallback(() => {
    if (onMoveEnd && mapRef.current) {
      const bounds = mapRef.current.getMap()?.getBounds();
      if (bounds) {
        onMoveEnd(bounds);
      }
    }
  }, [onMoveEnd]);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        onLoad={handleLoad}
        style={{ width: '100%', height: '100%' }}
        mapStyle={styleUrl}
        attributionControl={true}
      />
    </div>
  );
}
