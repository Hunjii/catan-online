/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double mount peer connection issues
  transpilePackages: ['three'],
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Fix Windows ENOENT race condition on .next/cache/webpack/*.pack.gz
      config.cache = false;
      if (isServer) {
        config.optimization = {
          ...(config.optimization ?? {}),
          splitChunks: false,
        };
      }
    }
    return config;
  },
};

export default nextConfig;

