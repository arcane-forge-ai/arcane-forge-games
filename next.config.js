/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/games',
        destination: '/games',
      },
      {
        source: '/game-library/:slug',
        destination: '/game-library/:slug/index.html',
      },
    ];
  },
};

module.exports = nextConfig; 