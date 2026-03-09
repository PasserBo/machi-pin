import Link from 'next/link';

/** Height of the fixed top nav bar (use for padding-top on page content). */
export const TOP_NAV_BAR_HEIGHT = 64;

export default function TopNavBar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 bg-white/90 backdrop-blur-md border-b border-gray-200/80"
      style={{ minHeight: TOP_NAV_BAR_HEIGHT }}
    >
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded"
        >
          📍 Machi-Pin
        </Link>
        <Link
          href="/login"
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}
