/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bus-promotion-bucket.s3-ap-southeast-1.amazonaws.com',
        pathname: '/production/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", // what frontend calls
        destination: `${process.env.NEXT_PUBLIC_BETTER_SERVER}/api/:path*`, // your Express API
      },
    ];
  },
  experimental: {
    nodeMiddleware: true,
  },
};

module.exports = nextConfig;
