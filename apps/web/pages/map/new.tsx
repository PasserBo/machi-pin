import { useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import type { MapCanvasHandle } from '@/components/MapCanvas';

// Dynamic import to avoid SSR issues with maplibre-gl
const MapCanvas = dynamic(() => import('@/components/MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-400 border-r-transparent" />
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function NewMapPage() {
  const router = useRouter();
  const mapRef = useRef<MapCanvasHandle>(null);

  const handleGetBounds = useCallback(() => {
    const bounds = mapRef.current?.getBounds();
    if (bounds) {
      console.log('Current bounds:', bounds.toArray());
    }
  }, []);

  const handleCreate = useCallback(() => {
    const bounds = mapRef.current?.getBounds();
    if (bounds) {
      // TODO: Save map with current bounds
      console.log('Creating map with bounds:', bounds.toArray());
    }
  }, []);

  return (
    <>
      <Head>
        <title>New Map - Machi-Pin</title>
      </Head>

      <div className="h-screen w-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between pointer-events-none">
          <button
            onClick={() => router.push('/dashboard')}
            className="pointer-events-auto px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg shadow-md hover:bg-white transition font-medium"
          >
            ← Back
          </button>

          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={handleGetBounds}
              className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg shadow-md hover:bg-white transition"
            >
              Get Bounds
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-black text-white rounded-lg shadow-md hover:bg-gray-800 transition font-medium"
            >
              Create Map
            </button>
          </div>
        </header>

        {/* Fullscreen Map */}
        <div className="flex-1 w-full h-full">
          <MapCanvas ref={mapRef} />
        </div>
      </div>
    </>
  );
}

