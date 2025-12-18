import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/auth/AuthContext';
import MapNameModal from '@/components/MapNameModal';
import type { MapCanvasHandle, MapStyleKey } from '@/components/MapCanvas';
import { MAP_STYLES } from '@/components/MapCanvas';
import type { MapDocument } from '@repo/types';

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

// Style options for the selector
const STYLE_OPTIONS: { key: MapStyleKey; label: string; icon: string }[] = [
  { key: 'basic', label: 'Basic', icon: '🗺️' },
  { key: 'streets', label: 'Streets', icon: '🛣️' },
];

export default function NewMapPage() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  
  // Store the map handle in a ref (set via callback, not forwardRef)
  const mapHandleRef = useRef<MapCanvasHandle | null>(null);
  
  const [selectedStyle, setSelectedStyle] = useState<MapStyleKey>('basic');
  const [isMapReady, setIsMapReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Callback when map is ready
  const handleMapReady = useCallback((handle: MapCanvasHandle) => {
    mapHandleRef.current = handle;
    setIsMapReady(true);
  }, []);

  // Open the naming modal
  const handleCutClick = useCallback(() => {
    // Check if user is logged in first
    if (!user) {
      setError('请先登录后再创建地图');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }
    
    // Check if map is ready
    if (!isMapReady || !mapHandleRef.current) {
      setError('地图正在加载中，请稍后再试');
      return;
    }
    
    // Check if we can get map data
    const bounds = mapHandleRef.current.getBounds();
    if (!bounds) {
      setError('无法获取地图数据，请稍后再试');
      return;
    }
    
    setIsModalOpen(true);
  }, [user, router, isMapReady]);

  // Handle save after user confirms the name
  const handleSave = useCallback(async (mapName: string) => {
    if (!user) {
      setError('请先登录');
      router.push('/login');
      return;
    }

    if (!mapHandleRef.current) {
      setError('地图未准备好，请重试');
      return;
    }

    const bounds = mapHandleRef.current.getBounds();
    const center = mapHandleRef.current.getCenter();
    const zoom = mapHandleRef.current.getZoom();

    if (!bounds || !center || zoom === undefined) {
      setError('无法获取地图状态，请重试');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Extract bounding box from MapLibre bounds object
      const boundingBox = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      };

      // Prepare the document data
      const mapData: Omit<MapDocument, 'id'> = {
        name: mapName,
        ownerUid: firebaseUser?.uid || '',
        styleKey: selectedStyle,
        styleUrl: MAP_STYLES[selectedStyle],
        boundingBox,
        center,
        zoom,
        pinCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Write to Firestore
      const docRef = await addDoc(collection(db, 'maps'), mapData);

      // Success! Close modal and redirect
      setIsModalOpen(false);
      router.push(`/map/${docRef.id}`);
    } catch (err) {
      console.error('Failed to save map:', err);
      setError('保存失败，请重试。' + (err instanceof Error ? ` (${err.message})` : ''));
      setIsSaving(false);
    }
  }, [user, router, selectedStyle, firebaseUser]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    if (!isSaving) {
      setIsModalOpen(false);
    }
  }, [isSaving]);

  // Dismiss error
  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <>
      <Head>
        <title>New Map - Machi-Pin</title>
      </Head>

      <div className="h-screen w-screen flex flex-col overflow-hidden relative">
        {/* Layer 1: Fullscreen Map (bottom) */}
        <div className="absolute inset-0">
          <MapCanvas 
            mapStyle={selectedStyle} 
            onMapReady={handleMapReady}
          />
        </div>

        {/* Layer 2: Viewfinder Overlay (middle, z-10) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <ViewfinderOverlay />
        </div>

        {/* Layer 3: Top Bar (z-20) */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl shadow-lg hover:bg-white transition font-medium"
          >
            ← Back
          </button>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-slide-down">
            <div className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
              <span>⚠️</span>
              <span>{error}</span>
              <button 
                onClick={dismissError}
                className="ml-2 hover:bg-red-600 rounded-full p-1 transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Layer 3: Bottom Control Bar (z-20) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-gray-200 rounded-t-3xl shadow-2xl">
          <div className="p-6 space-y-5">
            {/* Style Selector */}
            <div>
              <p className="text-sm text-gray-500 mb-3 font-medium">Map Style</p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.key}
                    onClick={() => setSelectedStyle(style.key)}
                    className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all duration-200 ${
                      selectedStyle === style.key
                        ? 'border-black bg-black text-white shadow-lg scale-105'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <span className="text-lg">{style.icon}</span>
                    <span className="font-medium">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cut Button */}
            <button
              onClick={handleCutClick}
              disabled={!isMapReady}
              className="w-full py-4 bg-black text-white text-lg font-semibold rounded-2xl shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isMapReady ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Loading...
                </>
              ) : (
                <>
                  <span className="text-xl">✂️</span>
                  Cut This Area
                </>
              )}
            </button>
          </div>
        </div>

        {/* Map Name Modal */}
        <MapNameModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleSave}
          isLoading={isSaving}
        />
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

/**
 * Viewfinder Overlay Component
 * Creates a camera viewfinder effect with a transparent center and dark edges
 */
function ViewfinderOverlay() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* The viewfinder frame */}
      <div
        className="relative"
        style={{
          width: '80%',
          height: '60%',
          maxWidth: '600px',
          maxHeight: '500px',
        }}
      >
        {/* White border frame */}
        <div 
          className="absolute inset-0 rounded-3xl border-4 border-white shadow-2xl"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        />

        {/* Corner markers for viewfinder effect */}
        <ViewfinderCorners />

        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 relative opacity-60">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white transform -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white transform -translate-x-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Corner brackets for the viewfinder
 */
function ViewfinderCorners() {
  const cornerStyle = "absolute w-8 h-8 border-white";
  
  return (
    <>
      {/* Top Left */}
      <div 
        className={`${cornerStyle} top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl`}
        style={{ margin: '-2px' }}
      />
      {/* Top Right */}
      <div 
        className={`${cornerStyle} top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl`}
        style={{ margin: '-2px' }}
      />
      {/* Bottom Left */}
      <div 
        className={`${cornerStyle} bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl`}
        style={{ margin: '-2px' }}
      />
      {/* Bottom Right */}
      <div 
        className={`${cornerStyle} bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl`}
        style={{ margin: '-2px' }}
      />
    </>
  );
}
