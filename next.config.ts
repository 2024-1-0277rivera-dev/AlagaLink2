import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'www.transparenttextures.com',
      },
      {
        protocol: 'https',
        hostname: 'alagalink.ph',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fmnl33-1.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fmnl34-1.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'facebook.com',
      },
      {
        protocol: 'https',
        hostname: 'www.facebook.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
      },
      {
        protocol: 'https',
        hostname: '**.flickr.com',
      },
      {
        protocol: 'https',
        hostname: '**.medium.com',
      },
      {
        protocol: 'https',
        hostname: '**.gravatar.com',
      },
    ],
  },
};

export default nextConfig;
