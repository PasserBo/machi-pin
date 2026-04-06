/**
 * Axis-aligned geographic bounds (north > south, east > west).
 * Does not handle anti-meridian crossing; sufficient for local maps.
 */
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Extra pan room beyond the saved map area (linear scale on width/height). */
export const MAP_PAN_EXPANSION_FACTOR = 1.2;

/**
 * Expands the box about its center so lat/lng spans are multiplied by `factor`.
 */
export function expandBoundingBox(box: BoundingBox, factor: number): BoundingBox {
  const latCenter = (box.north + box.south) / 2;
  const lngCenter = (box.east + box.west) / 2;
  const latSpan = (box.north - box.south) * factor;
  const lngSpan = (box.east - box.west) * factor;
  return {
    north: latCenter + latSpan / 2,
    south: latCenter - latSpan / 2,
    east: lngCenter + lngSpan / 2,
    west: lngCenter - lngSpan / 2,
  };
}

export function isLngLatInBoundingBox(
  lat: number,
  lng: number,
  box: BoundingBox,
): boolean {
  return (
    lat <= box.north &&
    lat >= box.south &&
    lng <= box.east &&
    lng >= box.west
  );
}
