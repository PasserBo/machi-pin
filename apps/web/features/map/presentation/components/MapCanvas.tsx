'use client';

import {
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import Map, { MapRef, ViewStateChangeEvent } from 'react-map-gl/maplibre';
import type { LngLatBounds, LngLatBoundsLike, FitBoundsOptions } from 'maplibre-gl';

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
 * Bounding box in Firestore format
 */
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

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
  /** Map style key (basic, streets) - used if styleUrl is not provided */
  mapStyle?: MapStyleKey;
  /** Direct style URL - takes precedence over mapStyle */
  styleUrl?: string;
  /** Initial view state */
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  /** Max bounds to restrict map panning (Firestore format) */
  maxBounds?: BoundingBox;
  /** Fit to bounds on load (overrides initialViewState) */
  fitBounds?: BoundingBox;
  /** Padding for fitBounds */
  fitBoundsPadding?: number;
  /** Callback when map stops moving */
  onMoveEnd?: (bounds: LngLatBounds) => void;
  /** Callback when map is ready, provides handle for parent to use */
  onMapReady?: (handle: MapCanvasHandle) => void;
  /** Children to render inside the map (e.g., Markers, Popups) */
  children?: ReactNode;
}

export default function MapCanvas({
  className = '',
  mapStyle = 'basic',
  styleUrl: customStyleUrl,
  initialViewState,
  maxBounds,
  fitBounds,
  fitBoundsPadding = 20,
  onMoveEnd,
  onMapReady,
  children,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(
    initialViewState || DEFAULT_VIEW_STATE
  );

  // Use custom styleUrl if provided, otherwise use mapStyle key
  const styleUrl = customStyleUrl || MAP_STYLES[mapStyle];

  // Convert Firestore boundingBox format to MapLibre format
  const mapLibreMaxBounds = useMemo((): LngLatBoundsLike | undefined => {
    if (!maxBounds) return undefined;
    return [
      maxBounds.west,
      maxBounds.south,
      maxBounds.east,
      maxBounds.north,
    ];
  }, [maxBounds]);

  const createHandle = useCallback((): MapCanvasHandle => ({
    getBounds: () => mapRef.current?.getMap()?.getBounds(),
    getCenter: () => {
      const center = mapRef.current?.getMap()?.getCenter();
      if (!center) return undefined;
      return { lat: center.lat, lng: center.lng };
    },
    getZoom: () => mapRef.current?.getMap()?.getZoom(),
    getMap: () => mapRef.current?.getMap(),
  }), []);

  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map && fitBounds) {
      const bounds: LngLatBoundsLike = [
        [fitBounds.west, fitBounds.south],
        [fitBounds.east, fitBounds.north],
      ];
      map.fitBounds(bounds, {
        padding: fitBoundsPadding,
        duration: 0,
      } as FitBoundsOptions);
    }
    if (onMapReady) onMapReady(createHandle());
  }, [onMapReady, createHandle, fitBounds, fitBoundsPadding]);

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  const handleMoveEnd = useCallback(() => {
    if (onMoveEnd && mapRef.current) {
      const bounds = mapRef.current.getMap()?.getBounds();
      if (bounds) onMoveEnd(bounds);
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
        maxBounds={mapLibreMaxBounds}
        attributionControl={true}
      >
        {children}
      </Map>
    </div>
  );
}
