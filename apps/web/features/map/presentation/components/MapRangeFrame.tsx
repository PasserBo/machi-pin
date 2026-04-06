'use client';

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import type { BoundingBox } from '../../domain/boundingBox';

/** Web Mercator–friendly world extent for the mask outer ring. */
const WORLD_SW: [number, number] = [-180, -85];
const WORLD_NW: [number, number] = [-180, 85];
const WORLD_NE: [number, number] = [180, 85];
const WORLD_SE: [number, number] = [180, -85];

interface MapRangeFrameProps {
  boundingBox: BoundingBox;
}

/**
 * Masks map tiles outside the saved selection (polygon with hole) and draws a border on the range.
 * Raster tiles cannot be clipped; the overlay approximates “only show this area.”
 */
export default function MapRangeFrame({ boundingBox }: MapRangeFrameProps) {
  const { north, south, east, west } = boundingBox;

  const data = useMemo(() => {
    // Exterior CCW; hole CW (MapLibre / GeoJSON winding).
    const outer: [number, number][] = [
      WORLD_SW,
      WORLD_NW,
      WORLD_NE,
      WORLD_SE,
      WORLD_SW,
    ];
    const inner: [number, number][] = [
      [west, south],
      [west, north],
      [east, north],
      [east, south],
      [west, south],
    ];

    const frameRing: [number, number][] = [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ];

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { kind: 'mask' as const },
          geometry: {
            type: 'Polygon',
            coordinates: [outer, inner],
          },
        },
        {
          type: 'Feature',
          properties: { kind: 'frame' as const },
          geometry: {
            type: 'LineString',
            coordinates: frameRing,
          },
        },
      ],
    };
  }, [north, south, east, west]);

  return (
    <Source id="map-content-range" type="geojson" data={data}>
      <Layer
        id="map-content-range-mask"
        type="fill"
        filter={['==', ['get', 'kind'], 'mask']}
        paint={{
          'fill-color': '#f1f5f9',
          'fill-opacity': 0.94,
        }}
      />
      <Layer
        id="map-content-range-line"
        type="line"
        filter={['==', ['get', 'kind'], 'frame']}
        paint={{
          'line-color': '#ffffff',
          'line-width': 3,
          'line-opacity': 0.95,
        }}
      />
    </Source>
  );
}
