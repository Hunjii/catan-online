/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double mount peer connection issues
  transpilePackages: ['three'],
  webpack: (config, { dev }) => {
    if (dev) {
      // Fix Windows ENOENT race condition on .next/cache/webpack/*.pack.gz
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;

