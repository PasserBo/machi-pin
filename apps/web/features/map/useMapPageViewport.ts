import { useEffect } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Prevents document rubber-band scroll on full-screen map routes (esp. mobile Safari).
 */
export function useLockDocumentScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;

    html.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.height = '100%';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.height = prevHtmlHeight;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
    };
  }, []);
}

/**
 * Keeps MapLibre’s canvas in sync when Safari shows/hides the URL bar or the visual viewport changes.
 */
export function useMapResizeOnVisualViewport(getMap: () => MapLibreMap | undefined) {
  useEffect(() => {
    const resize = () => {
      getMap()?.resize();
    };

    resize();

    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    vv?.addEventListener('resize', resize);
    vv?.addEventListener('scroll', resize);
    window.addEventListener('resize', resize);

    return () => {
      vv?.removeEventListener('resize', resize);
      vv?.removeEventListener('scroll', resize);
      window.removeEventListener('resize', resize);
    };
  }, [getMap]);
}
