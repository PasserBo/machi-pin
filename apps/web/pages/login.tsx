import Head from 'next/head';

export default function Login() {
  return (
    <>
      <Head>
        <title>Login - Machi-Pin</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center analog-paper">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Welcome to Machi-Pin
          </h1>
          <div className="space-y-4">
            <button className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition">
              Sign in with Google
            </button>
            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              Sign in with Email
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-600 text-center">
            Your digital scrapbook for places and memories
          </p>
        </div>
      </div>
    </>
  );
}

