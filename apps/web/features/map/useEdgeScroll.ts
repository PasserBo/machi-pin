import { useRef, useCallback, useEffect } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

interface EdgeScrollConfig {
  edgeThreshold?: number;
  maxSpeed?: number;
  enabled?: boolean;
}

interface Position {
  x: number;
  y: number;
}

export function useEdgeScroll(
  getMap: () => MapLibreMap | undefined,
  config: EdgeScrollConfig = {}
) {
  const { edgeThreshold = 50, maxSpeed = 15, enabled = true } = config;
  const pointerPosition = useRef<Position | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const isScrolling = useRef(false);

  const calculatePanVector = useCallback((x: number, y: number): Position | null => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let panX = 0, panY = 0;
    if (x < edgeThreshold) panX = -((edgeThreshold - x) / edgeThreshold) * maxSpeed;
    else if (x > width - edgeThreshold) panX = ((x - (width - edgeThreshold)) / edgeThreshold) * maxSpeed;
    if (y < edgeThreshold) panY = -((edgeThreshold - y) / edgeThreshold) * maxSpeed;
    else if (y > height - edgeThreshold) panY = ((y - (height - edgeThreshold)) / edgeThreshold) * maxSpeed;
    if (panX === 0 && panY === 0) return null;
    return { x: panX, y: panY };
  }, [edgeThreshold, maxSpeed]);

  const animate = useCallback(() => {
    if (!enabled || !pointerPosition.current) { isScrolling.current = false; return; }
    const map = getMap();
    if (!map) { isScrolling.current = false; return; }
    const panVector = calculatePanVector(pointerPosition.current.x, pointerPosition.current.y);
    if (panVector) {
      map.panBy([panVector.x, panVector.y], { duration: 0, easing: (t) => t });
      isScrolling.current = true;
      animationFrameId.current = requestAnimationFrame(animate);
    } else isScrolling.current = false;
  }, [enabled, getMap, calculatePanVector]);

  const updatePosition = useCallback((x: number, y: number) => {
    pointerPosition.current = { x, y };
    if (!isScrolling.current && enabled) {
      const panVector = calculatePanVector(x, y);
      if (panVector) {
        isScrolling.current = true;
        animationFrameId.current = requestAnimationFrame(animate);
      }
    }
  }, [enabled, calculatePanVector, animate]);

  const stopScroll = useCallback(() => {
    pointerPosition.current = null;
    isScrolling.current = false;
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  useEffect(() => () => {
    if (animationFrameId.current !== null) cancelAnimationFrame(animationFrameId.current);
  }, []);

  return { updatePosition, stopScroll };
}

export default useEdgeScroll;
