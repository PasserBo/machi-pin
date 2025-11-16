import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <>
      <Head>
        <title>Machi-Pin - Your Digital Scrapbook for Places and Memories</title>
        <meta name="description" content="Capture, sketch, and cherish your favorite places with Machi-Pin" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Navigation */}
        <nav className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-2xl font-bold">📍 Machi-Pin</div>
          <Link
            href="/login"
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
          >
            Sign In
          </Link>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              Your Digital<br />
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Scrapbook
              </span>
              <br />
              for Places
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto">
              Capture memories, sketch moments, and create beautiful maps of your favorite places. 
              Like a handmade travel journal, but better.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login"
                className="px-8 py-4 bg-black text-white rounded-full text-lg font-semibold hover:bg-gray-800 transition transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <button className="px-8 py-4 border-2 border-gray-300 rounded-full text-lg font-semibold hover:border-gray-400 transition">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-32 grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur p-8 rounded-3xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-2xl font-bold mb-3">Capture Moments</h3>
              <p className="text-gray-600">
                Take photos of places you love and pin them on your personal map. Never forget where that amazing coffee shop was.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur p-8 rounded-3xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">✏️</div>
              <h3 className="text-2xl font-bold mb-3">Sketch & Doodle</h3>
              <p className="text-gray-600">
                Add sketches, notes, and drawings to your photos. Express yourself like a real analog scrapbook.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur p-8 rounded-3xl shadow-lg hover:shadow-xl transition">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-2xl font-bold mb-3">Beautiful Maps</h3>
              <p className="text-gray-600">
                Organize your memories into themed maps. City trips, food tours, or hidden gems—it&apos;s all yours.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-32 text-center">
            <h2 className="text-4xl font-bold mb-16">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold mb-2">Create a Map</h4>
                <p className="text-gray-600 text-sm">Start a new collection for your adventure</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold mb-2">Take Photos</h4>
                <p className="text-gray-600 text-sm">Capture places that matter to you</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold mb-2">Add Sketches</h4>
                <p className="text-gray-600 text-sm">Draw and doodle on your photos</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h4 className="font-semibold mb-2">Share & Cherish</h4>
                <p className="text-gray-600 text-sm">Keep your memories forever</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-32 bg-black text-white rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join Machi-Pin today and start collecting your favorite places
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-white text-black rounded-full text-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
            >
              Create Your First Map
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-20">
          <div className="max-w-7xl mx-auto px-6 py-12 text-center text-gray-600">
            <p className="mb-2">📍 Machi-Pin</p>
            <p className="text-sm">Your digital scrapbook for places and memories</p>
            <p className="text-sm mt-4">© 2025 Machi-Pin. Made with ❤️</p>
          </div>
        </footer>
      </div>
    </>
  );
}

