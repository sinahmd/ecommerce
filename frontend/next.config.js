/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  // Add multiple redirects for better routing
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
      {
        source: '/index',
        destination: '/home',
        permanent: true,
      },
      // Add a catchall redirect for '/home' to ensure it goes to the correct route
      {
        source: '/home/',
        destination: '/home',
        permanent: true,
      }
    ];
  },
};

module.exports = nextConfig; 