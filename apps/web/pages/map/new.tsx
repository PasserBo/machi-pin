import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/auth/AuthContext';
import type { MapCanvasHandle, MapStyleKey } from '@/components/MapCanvas';

// We import MAP_STYLES dynamically since it's bundled with MapCanvas

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
  const { user } = useAuth();
  const mapRef = useRef<MapCanvasHandle>(null);
  const [selectedStyle, setSelectedStyle] = useState<MapStyleKey>('basic');
  const [isSaving, setIsSaving] = useState(false);

  const handleCut = useCallback(async () => {
    const bounds = mapRef.current?.getBounds();
    if (!bounds) {
      alert('Could not get map bounds');
      return;
    }

    // Prompt for map name
    const mapName = window.prompt('Enter a name for your map:', 'My New Map');
    if (!mapName) return; // User cancelled

    if (!user) {
      alert('Please log in to create a map');
      router.push('/login');
      return;
    }

    setIsSaving(true);

    try {
      const boundsArray = bounds.toArray();
      const sw = boundsArray[0];
      const ne = boundsArray[1];
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'maps'), {
        name: mapName,
        ownerId: user.id,
        style: selectedStyle,
        bounds: {
          sw: { lng: sw?.[0] ?? 0, lat: sw?.[1] ?? 0 },
          ne: { lng: ne?.[0] ?? 0, lat: ne?.[1] ?? 0 },
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Redirect to the new map
      router.push(`/map/${docRef.id}`);
    } catch (error) {
      console.error('Failed to create map:', error);
      alert('Failed to create map. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [user, router, selectedStyle]);

  return (
    <>
      <Head>
        <title>New Map - Machi-Pin</title>
      </Head>

      <div className="h-screen w-screen flex flex-col overflow-hidden relative">
        {/* Layer 1: Fullscreen Map (bottom) */}
        <div className="absolute inset-0">
          <MapCanvas ref={mapRef} mapStyle={selectedStyle} />
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
              onClick={handleCut}
              disabled={isSaving}
              className="w-full py-4 bg-black text-white text-lg font-semibold rounded-2xl shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Saving...
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
      </div>
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
