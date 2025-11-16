import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard - Machi-Pin</title>
      </Head>
      <div className="min-h-screen analog-paper">
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">📚 My Desk (书桌)</h1>
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
        </main>
      </div>
    </>
  );
}

