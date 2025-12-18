import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MapCard, { type MapListItem } from '@/components/MapCard';

export default function Dashboard() {
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
