import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
  const { user, signOut } = useAuth();

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
      <div className="min-h-screen analog-paper">
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">📚 My Desk</h1>
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{user?.displayName || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <button
                onClick={handleSignOut}
                className="py-2 px-4 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <button className="py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition">
              + New Map
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder map cards */}
            <Link href="/map/sample-map-1" className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">🗺️ Map Preview</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sample Map 1</h3>
                <p className="text-gray-600 text-sm">0 pins</p>
              </div>
            </Link>
          </div>

          {/* Welcome message for new users */}
          <div className="mt-12 bg-white rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Welcome to Machi-Pin! 🎉</h2>
            <p className="text-gray-600 mb-6">
              Start creating your first map to collect and organize your favorite places.
            </p>
            <button className="py-3 px-8 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition font-semibold">
              Create Your First Map
            </button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

