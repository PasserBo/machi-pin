import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { MapDocument } from '@repo/types';
import type { BoundingBox } from '@/components/MapCanvas';

// Dynamic import to avoid SSR issues with maplibre-gl
const MapCanvas = dynamic(() => import('@/components/MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent mb-4" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

// Extended MapDocument with id
interface MapData extends MapDocument {
  id: string;
}

export default function MapDetailPage() {
  const router = useRouter();
  const { mapId } = router.query;
  const { firebaseUser } = useAuth();
  
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch map data from Firestore
  useEffect(() => {
    async function fetchMap() {
      if (!mapId || typeof mapId !== 'string') {
        return;
      }

      if (!firebaseUser?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const mapRef = doc(db, 'maps', mapId);
        const mapSnap = await getDoc(mapRef);

        if (!mapSnap.exists()) {
          setError('地图不存在');
          setIsLoading(false);
          return;
        }

        const data = mapSnap.data() as MapDocument;

        // Security check: Only owner can view (for now)
        // TODO: Add public map support later
        if (data.ownerUid !== firebaseUser.uid) {
          setError('您没有权限查看此地图');
          setIsLoading(false);
          return;
        }

        setMapData({
          id: mapSnap.id,
          ...data,
        });
      } catch (err) {
        console.error('Failed to fetch map:', err);
        setError('加载失败，请重试');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMap();
  }, [mapId, firebaseUser?.uid]);

  return (
    <ProtectedRoute>
      <Head>
        <title>{mapData?.name || 'Map'} - Machi-Pin</title>
      </Head>

      <div className="h-screen w-screen flex flex-col overflow-hidden relative">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 z-50">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent mb-4" />
              <p className="text-gray-600 font-medium">Loading your map...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 z-50">
            <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-xl border border-red-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                <span className="text-3xl">😔</span>
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-900">{error}</h2>
              <p className="text-gray-500 mb-6">
                The map you're looking for might have been deleted or you don't have permission to view it.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 py-3 px-6 bg-black text-white rounded-2xl hover:bg-gray-800 transition font-medium"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Map View */}
        {mapData && !isLoading && !error && (
          <>
            {/* Fullscreen Map */}
            <div className="absolute inset-0">
              <MapCanvas
                styleUrl={mapData.styleUrl}
                initialViewState={{
                  longitude: mapData.center.lng,
                  latitude: mapData.center.lat,
                  zoom: mapData.zoom,
                }}
                maxBounds={mapData.boundingBox as BoundingBox}
              />
            </div>

            {/* Top Left: Back Button */}
            <div className="absolute top-4 left-4 z-20">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md text-gray-700 rounded-xl shadow-lg hover:bg-white transition font-medium border border-white/50"
              >
                <span>←</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </div>

            {/* Top Right: Map Info */}
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg px-4 py-2.5 border border-white/50">
                <h1 className="font-semibold text-gray-800 truncate max-w-[200px]">
                  {mapData.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-red-500">📍</span>
                  <span>{mapData.pinCount || 0} pins</span>
                </div>
              </div>
            </div>

            {/* Bottom: Future Pin Toolbar Placeholder */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
              <div className="flex justify-center pb-8">
                {/* Placeholder for future Add Pin button */}
                <div className="pointer-events-auto">
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full shadow-xl hover:bg-gray-800 active:scale-[0.98] transition-all font-semibold"
                    onClick={() => {
                      // TODO: Implement add pin functionality
                      alert('Add Pin feature coming soon!');
                    }}
                  >
                    <span className="text-lg">+</span>
                    Add Pin
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
