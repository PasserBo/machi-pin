import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { MapDocument } from '@repo/types';

// Extended MapDocument with id for list display
interface MapListItem extends MapDocument {
  id: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, firebaseUser, signOut } = useAuth();
  const [maps, setMaps] = useState<MapListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's maps from Firestore
  useEffect(() => {
    async function fetchMaps() {
      if (!firebaseUser?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const mapsRef = collection(db, 'maps');
        const q = query(
          mapsRef,
          where('ownerUid', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const mapsList: MapListItem[] = [];

        querySnapshot.forEach((doc) => {
          mapsList.push({
            id: doc.id,
            ...doc.data(),
          } as MapListItem);
        });

        setMaps(mapsList);
      } catch (err) {
        console.error('Failed to fetch maps:', err);
        setError('地图加载失败，请刷新重试');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMaps();
  }, [firebaseUser?.uid]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard - Machi-Pin</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-amber-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-amber-900">📚 My Desk</h1>
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-800">{user?.displayName || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full ring-2 ring-amber-200"
                />
              )}
              <button
                onClick={handleSignOut}
                className="py-2 px-4 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">我的探索地图</h2>
              <p className="text-gray-500">My Exploration Maps</p>
            </div>
            <Link
              href="/map/new"
              className="py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] font-semibold flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              New Map
            </Link>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent mb-4" />
                <p className="text-gray-500">Loading your maps...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition"
              >
                Refresh
              </button>
            </div>
          )}

          {/* Maps Grid */}
          {!isLoading && !error && maps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {maps.map((map) => (
                <MapCard key={map.id} map={map} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && maps.length === 0 && (
            <div className="mt-8 bg-white rounded-3xl p-10 text-center max-w-xl mx-auto shadow-lg border border-amber-100">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mb-6">
                <span className="text-4xl">🗺️</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Welcome to Machi-Pin! 🎉</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Start creating your first map to collect and organize your favorite places.<br />
                Each map is like a treasure chest of memories.
              </p>
              <Link
                href="/map/new"
                className="inline-flex items-center gap-2 py-4 px-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                <span>✨</span>
                Create Your First Map
              </Link>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

/**
 * Map Card Component - Designed to look like a folded paper map
 */
function MapCard({ map }: { map: MapListItem }) {
  const formattedDate = formatDate(map.createdAt);
  
  // Generate a simple static map preview URL using the bounds
  const previewUrl = generateMapPreview(map);

  return (
    <Link href={`/map/${map.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100 group-hover:border-amber-300 group-hover:-translate-y-1">
        {/* Map Preview */}
        <div className="relative h-44 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={map.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl opacity-30">🗺️</span>
              </div>
            </div>
          )}
          
          {/* Folded corner effect */}
          <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
            <div 
              className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-300 transform rotate-45 translate-x-8 -translate-y-8 shadow-inner"
            />
          </div>
          
          {/* Pin count badge */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm flex items-center gap-1">
            <span className="text-red-500">📍</span>
            {map.pinCount || 0}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-amber-700 transition-colors">
            {map.name}
          </h3>
          
          {/* Meta info */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>📅</span>
            <span>{formattedDate}</span>
          </div>
          
          {/* Style tag */}
          <div className="mt-3">
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full capitalize">
              {map.styleKey || 'basic'}
            </span>
          </div>
        </div>

        {/* Bottom decorative edge - like folded paper */}
        <div className="h-1 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200" />
      </div>
    </Link>
  );
}

/**
 * Format Firestore timestamp to readable date
 */
function formatDate(timestamp: unknown): string {
  if (!timestamp) return 'Unknown date';
  
  try {
    // Handle Firestore Timestamp
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    
    // Handle Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    
    // Handle object with toDate method (Firestore Timestamp from SDK)
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      const ts = timestamp as { toDate: () => Date };
      return ts.toDate().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    return 'Unknown date';
  } catch {
    return 'Unknown date';
  }
}

/**
 * Generate a static map preview URL using Maptiler
 */
function generateMapPreview(map: MapListItem): string | null {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!key || !map.center) return null;
  
  const { lng, lat } = map.center;
  const zoom = Math.min((map.zoom || 12) - 1, 14); // Slightly zoomed out for preview
  
  // Maptiler static map API
  return `https://api.maptiler.com/maps/${map.styleKey || 'basic'}/static/${lng},${lat},${zoom}/400x200@2x.png?key=${key}`;
}
