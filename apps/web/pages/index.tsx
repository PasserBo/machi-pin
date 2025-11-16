import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Check authentication state
    // For now, redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <>
      <Head>
        <title>Machi-Pin - Loading...</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Machi-Pin</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    </>
  );
}

