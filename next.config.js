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
};

module.exports = nextConfig;
