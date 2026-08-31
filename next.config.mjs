/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents double mount peer connection issues
  transpilePackages: ['three'],
};

export default nextConfig;
