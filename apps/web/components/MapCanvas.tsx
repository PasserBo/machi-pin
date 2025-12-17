'use client';

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react';
import Map, { MapRef, ViewStateChangeEvent } from 'react-map-gl/maplibre';
import type { LngLatBounds } from 'maplibre-gl';

// Maptiler Basic style URL
const MAPTILER_STYLE = `https://api.maptiler.com/maps/base-v4/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

// Default view state (Tokyo)
const DEFAULT_VIEW_STATE = {
  longitude: 139.6917,
  latitude: 35.6895,
  zoom: 12,
};

export interface MapCanvasHandle {
  getBounds: () => LngLatBounds | undefined;
  getMap: () => maplibregl.Map | undefined;
}

interface MapCanvasProps {
  className?: string;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  onMoveEnd?: (bounds: LngLatBounds) => void;
}

const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(
  ({ className = '', initialViewState, onMoveEnd }, ref) => {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState(
      initialViewState || DEFAULT_VIEW_STATE
    );

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      getBounds: () => {
        return mapRef.current?.getMap().getBounds();
      },
      getMap: () => {
        return mapRef.current?.getMap();
      },
    }));

    const handleMove = useCallback((evt: ViewStateChangeEvent) => {
      setViewState(evt.viewState);
    }, []);

    const handleMoveEnd = useCallback(() => {
      if (onMoveEnd && mapRef.current) {
        const bounds = mapRef.current.getMap().getBounds();
        onMoveEnd(bounds);
      }
    }, [onMoveEnd]);

    return (
      <div className={className} style={{ width: '100%', height: '100%' }}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={handleMove}
          onMoveEnd={handleMoveEnd}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAPTILER_STYLE}
          attributionControl={true}
        />
      </div>
    );
  }
);

MapCanvas.displayName = 'MapCanvas';

export default MapCanvas;

