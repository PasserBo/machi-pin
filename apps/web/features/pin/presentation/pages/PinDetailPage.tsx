import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PinDetailPage() {
  const router = useRouter();
  const pinId = (router.query.pinId as string) ?? '';

  return (
    <>
      <Head>
        <title>Pin {pinId} - Machi-Pin</title>
        <meta property="og:title" content={`Pin ${pinId} - Machi-Pin`} />
        <meta property="og:description" content="Check out this memory on Machi-Pin" />
        <meta property="og:type" content="article" />
        {/* TODO: Add dynamic og:image based on pin data */}
      </Head>
      <div className="min-h-screen analog-paper">
        {/* Public Pin Share Page */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">Machi-Pin</h1>
            <button 
              onClick={() => router.push('/dashboard')}
              className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Create Your Own
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          {/* Pin Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 analog-paper">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2 analog-handwritten">
                Pin: {pinId}
              </h2>
              <p className="text-gray-600">📍 Location will be displayed here</p>
            </div>

            {/* Photo Preview */}
            <div className="mb-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">📷 Photo placeholder</span>
              </div>
            </div>

            {/* Sketch Preview */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">✏️ Sketch</h3>
              <div className="aspect-square bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Konva sketch canvas placeholder</span>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">📝 Notes</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="text-gray-700">Notes content will be displayed here...</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
              <p>Created: [timestamp placeholder]</p>
              <p>Location: [GPS coordinates placeholder]</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
