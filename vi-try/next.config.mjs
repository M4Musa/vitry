/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'us.khaadi.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'i.etsystatic.com',
      },
      {
        protocol: 'https',
        hostname: 'c8.alamy.com',
      },
      {
        protocol: 'https',
        hostname: 'www.gulahmedshop.com',
      },
    ],
  },
  output: 'standalone', // Ensure standalone mode for better deployment
  eslint: {
    // ✅ This ignores ESLint errors during Vercel build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
