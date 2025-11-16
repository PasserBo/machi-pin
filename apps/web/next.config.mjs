import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile packages that need ES module compilation
  transpilePackages: ['maplibre-gl', 'react-map-gl'],
  // Empty turbopack config to acknowledge we're aware of the webpack config from next-pwa
  turbopack: {},
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default pwaConfig(nextConfig);
