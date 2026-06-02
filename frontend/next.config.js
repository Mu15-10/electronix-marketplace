const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'electronix-marketplace.s3.amazonaws.com', 'picsum.photos', 'fastly.picsum.photos'],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://electronix-backend-te3q.onrender.com/api/v1/v1/:path*',
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
