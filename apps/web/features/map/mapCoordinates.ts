import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * MapLibre `project` / `unproject` use pixels relative to the map container, not the window.
 * Safari’s dynamic toolbars and page scroll change `getBoundingClientRect()` — always convert from client coords.
 */
export function mapClientToContainerPoint(
  map: MapLibreMap,
  clientX: number,
  clientY: number,
): [number, number] {
  const r = map.getContainer().getBoundingClientRect();
  return [clientX - r.left, clientY - r.top];
}

/** For `position: fixed` UI anchored to a geographic point. */
export function mapContainerPointToClient(
  map: MapLibreMap,
  containerX: number,
  containerY: number,
): { x: number; y: number } {
  const r = map.getContainer().getBoundingClientRect();
  return { x: r.left + containerX, y: r.top + containerY };
}
