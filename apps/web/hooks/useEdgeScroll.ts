import { useRef, useCallback, useEffect } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Configuration for edge scrolling
 */
interface EdgeScrollConfig {
  /** Distance from edge to trigger scrolling (in pixels) */
  edgeThreshold?: number;
  /** Maximum pan speed (pixels per frame) */
  maxSpeed?: number;
  /** Whether edge scrolling is enabled */
  enabled?: boolean;
}

/**
 * Position type
 */
interface Position {
  x: number;
  y: number;
}

/**
 * Hook for edge scrolling functionality (desktop only)
 * When the pointer is near the edge of the screen, the map pans automatically
 * 
 * @param getMap - Function to get the MapLibre map instance
 * @param config - Configuration options
 */
export function useEdgeScroll(
  getMap: () => MapLibreMap | undefined,
  config: EdgeScrollConfig = {}
) {
  const {
    edgeThreshold = 50,
    maxSpeed = 15,
    enabled = true,
  } = config;

  // Store the current pointer position
  const pointerPosition = useRef<Position | null>(null);
  // Animation frame ID for cleanup
  const animationFrameId = useRef<number | null>(null);
  // Flag to track if we're actively scrolling
  const isScrolling = useRef(false);

  /**
   * Calculate the pan vector based on pointer position relative to edges
   */
  const calculatePanVector = useCallback((x: number, y: number): Position | null => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    let panX = 0;
    let panY = 0;

    // Left edge
    if (x < edgeThreshold) {
      panX = -((edgeThreshold - x) / edgeThreshold) * maxSpeed;
    }
    // Right edge
    else if (x > width - edgeThreshold) {
      panX = ((x - (width - edgeThreshold)) / edgeThreshold) * maxSpeed;
    }

    // Top edge
    if (y < edgeThreshold) {
      panY = -((edgeThreshold - y) / edgeThreshold) * maxSpeed;
    }
    // Bottom edge
    else if (y > height - edgeThreshold) {
      panY = ((y - (height - edgeThreshold)) / edgeThreshold) * maxSpeed;
    }

    // Return null if no panning needed
    if (panX === 0 && panY === 0) {
      return null;
    }

    return { x: panX, y: panY };
  }, [edgeThreshold, maxSpeed]);

  /**
   * Animation loop for continuous panning
   */
  const animate = useCallback(() => {
    if (!enabled || !pointerPosition.current) {
      isScrolling.current = false;
      return;
    }

    const map = getMap();
    if (!map) {
      isScrolling.current = false;
      return;
    }

    const panVector = calculatePanVector(
      pointerPosition.current.x,
      pointerPosition.current.y
    );

    if (panVector) {
      // Pan the map
      map.panBy([panVector.x, panVector.y], {
        duration: 0,
        easing: (t) => t,
      });

      // Continue animating
      isScrolling.current = true;
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      isScrolling.current = false;
    }
  }, [enabled, getMap, calculatePanVector]);

  /**
   * Update pointer position and start scrolling if needed
   */
  const updatePosition = useCallback((x: number, y: number) => {
    pointerPosition.current = { x, y };

    // Start animation loop if not already running
    if (!isScrolling.current && enabled) {
      const panVector = calculatePanVector(x, y);
      if (panVector) {
        isScrolling.current = true;
        animationFrameId.current = requestAnimationFrame(animate);
      }
    }
  }, [enabled, calculatePanVector, animate]);

  /**
   * Stop edge scrolling
   */
  const stopScroll = useCallback(() => {
    pointerPosition.current = null;
    isScrolling.current = false;
    
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return {
    updatePosition,
    stopScroll,
  };
}

export default useEdgeScroll;

