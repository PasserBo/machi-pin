import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState } from 'react';

export default function MapView() {
  const router = useRouter();
  const { mapId } = router.query;
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{mapId ? `Map ${mapId}` : 'Map'} - Machi-Pin</title>
      </Head>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Desk
          </button>
          <h1 className="text-xl font-semibold">Map: {mapId}</h1>
          <button className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition">
            + Add Pin
          </button>
        </header>

        {/* Map Container */}
        <div className="flex-1 relative bg-gray-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-2xl mb-2">🗺️</p>
              <p>MapLibre map will be rendered here</p>
              <p className="text-sm mt-2">Map ID: {mapId}</p>
            </div>
          </div>

          {/* Sliding Panel for Camera (integrated as per memory) */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ${
              isPanelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'
            }`}
            style={{ height: '70vh' }}
          >
            {/* Panel Handle */}
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="w-full py-4 flex justify-center"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </button>

            {/* Panel Content */}
            <div className="px-6 pb-6 overflow-auto" style={{ height: 'calc(100% - 60px)' }}>
              {isPanelOpen ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">📷 Camera & Sketch</h2>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Camera preview will appear here</p>
                  </div>
                  <button className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                    Capture Photo
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500">Swipe up to access camera</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

