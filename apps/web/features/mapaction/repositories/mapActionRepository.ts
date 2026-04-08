import type { Map as MapLibreMap } from 'maplibre-gl';
import { mapClientToContainerPoint, mapContainerPointToClient } from '@/features/map/mapCoordinates';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface BoundingBoxLike {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function getMapFromHandle<THandle extends { getMap: () => MapLibreMap | undefined }>(
  mapHandle: THandle | null,
): MapLibreMap | undefined {
  return mapHandle?.getMap();
}

export function clientPointToLngLat(map: MapLibreMap, point: ScreenPoint): GeoPoint {
  const [mx, my] = mapClientToContainerPoint(map, point.x, point.y);
  const lngLat = map.unproject([mx, my]);
  return { lat: lngLat.lat, lng: lngLat.lng };
}

export function lngLatToClientPoint(map: MapLibreMap, point: GeoPoint): ScreenPoint {
  const projected = map.project([point.lng, point.lat]);
  return mapContainerPointToClient(map, projected.x, projected.y);
}

export function isLngLatInsideBoundingBox(
  point: GeoPoint,
  boundingBox: BoundingBoxLike | undefined,
): boolean {
  if (!boundingBox) return true;
  return (
    point.lat >= boundingBox.south &&
    point.lat <= boundingBox.north &&
    point.lng >= boundingBox.west &&
    point.lng <= boundingBox.east
  );
}

export function isTipInsideBoundingBox(
  map: MapLibreMap,
  tipClient: ScreenPoint,
  boundingBox: BoundingBoxLike | undefined,
): boolean {
  const lngLat = clientPointToLngLat(map, tipClient);
  return isLngLatInsideBoundingBox(lngLat, boundingBox);
}
