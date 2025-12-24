import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import PinToolbar from '@/components/PinToolbar';
import DragOverlay from '@/components/DragOverlay';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEdgeScroll } from '@/hooks/useEdgeScroll';
import type { MapDocument, PinColor } from '@repo/types';
import type { BoundingBox, MapCanvasHandle } from '@/components/MapCanvas';
import type { Map as MapLibreMap } from 'maplibre-gl';

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

// Drag state interface
interface DragState {
  isDragging: boolean;
  color: PinColor | null;
  position: { x: number; y: number };
}

// Y-offset for mobile to avoid finger obstruction
const MOBILE_DRAG_OFFSET_Y = 80;
const DESKTOP_DRAG_OFFSET_Y = 0;

export default function MapDetailPage() {
  const router = useRouter();
  const { mapId } = router.query;
  const { firebaseUser } = useAuth();
  
  // Map data state
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPinColor, setSelectedPinColor] = useState<PinColor | null>(null);

  // Map reference
  const mapHandleRef = useRef<MapCanvasHandle | null>(null);

  // Device detection
  const isMobile = useIsMobile();

  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    color: null,
    position: { x: 0, y: 0 },
  });

  // Get map instance for edge scrolling
  const getMap = useCallback((): MapLibreMap | undefined => {
    return mapHandleRef.current?.getMap();
  }, []);

  // Edge scrolling hook (desktop only)
  const { updatePosition: updateEdgeScrollPosition, stopScroll } = useEdgeScroll(
    getMap,
    { enabled: !isMobile && dragState.isDragging }
  );

  // Handle map ready
  const handleMapReady = useCallback((handle: MapCanvasHandle) => {
    mapHandleRef.current = handle;
  }, []);

  // Handle drag start from toolbar
  const handleDragStart = useCallback((event: { color: PinColor; position: { x: number; y: number } }) => {
    setDragState({
      isDragging: true,
      color: event.color,
      position: event.position,
    });
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragState.isDragging) return;

    // Update drag position
    setDragState(prev => ({
      ...prev,
      position: { x: clientX, y: clientY },
    }));

    // Desktop only: edge scrolling
    if (!isMobile) {
      updateEdgeScrollPosition(clientX, clientY);
    }
  }, [dragState.isDragging, isMobile, updateEdgeScrollPosition]);

  // Handle drag end
  const handleDragEnd = useCallback((clientX: number, clientY: number) => {
    if (!dragState.isDragging || !dragState.color) return;

    // Stop edge scrolling
    stopScroll();

    // Calculate the actual drop position (accounting for mobile offset)
    const offsetY = isMobile ? MOBILE_DRAG_OFFSET_Y : DESKTOP_DRAG_OFFSET_Y;
    const dropY = clientY - offsetY;

    // Get the map instance
    const map = mapHandleRef.current?.getMap();
    if (map) {
      // Convert screen coordinates to map coordinates
      const lngLat = map.unproject([clientX, dropY]);
      
      console.log('Pin dropped at:', {
        screen: { x: clientX, y: dropY },
        lngLat: { lng: lngLat.lng, lat: lngLat.lat },
        color: dragState.color,
      });

      // TODO: Create pin in Firestore
      // For now, just log the drop location
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      color: null,
      position: { x: 0, y: 0 },
    });
  }, [dragState.isDragging, dragState.color, isMobile, stopScroll]);

  // Handle drag cancel (e.g., escape key, drag out of bounds)
  const handleDragCancel = useCallback(() => {
    stopScroll();
    setDragState({
      isDragging: false,
      color: null,
      position: { x: 0, y: 0 },
    });
  }, [stopScroll]);

  // Global event listeners for drag using Pointer Events (unified mouse/touch/pen)
  useEffect(() => {
    if (!dragState.isDragging) return;

    // Pointer events (unified for mouse, touch, pen)
    const handlePointerMove = (e: PointerEvent) => {
      // Prevent default to avoid scrolling on touch devices
      e.preventDefault();
      handleDragMove(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      handleDragEnd(e.clientX, e.clientY);
    };

    const handlePointerCancel = () => {
      handleDragCancel();
    };

    // Keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDragCancel();
      }
    };

    // Prevent touch scrolling during drag
    const preventTouchScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    // Add listeners
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('keydown', handleKeyDown);
    // Also prevent touch scrolling
    window.addEventListener('touchmove', preventTouchScroll, { passive: false });

    // Cleanup
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchmove', preventTouchScroll);
    };
  }, [dragState.isDragging, handleDragMove, handleDragEnd, handleDragCancel]);

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
                // Use fitBounds to perfectly fit the saved viewfinder area
                fitBounds={mapData.boundingBox as BoundingBox}
                fitBoundsPadding={20}
                // Also set maxBounds to restrict panning to the saved area
                maxBounds={mapData.boundingBox as BoundingBox}
                onMapReady={handleMapReady}
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

            {/* Bottom: Pin Toolbar */}
            <PinToolbar
              selectedColor={selectedPinColor}
              onSelectColor={(color) => {
                // Toggle selection: clicking same color deselects
                setSelectedPinColor(prev => prev === color ? null : color);
              }}
              onDragStart={handleDragStart}
              isDragging={dragState.isDragging}
            />

            {/* Drag Overlay */}
            {dragState.isDragging && dragState.color && (
              <DragOverlay
                isDragging={dragState.isDragging}
                position={dragState.position}
                color={dragState.color}
                offsetY={isMobile ? MOBILE_DRAG_OFFSET_Y : DESKTOP_DRAG_OFFSET_Y}
              />
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
