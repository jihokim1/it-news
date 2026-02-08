import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', 
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 🟢 [이미지 설정 수정됨]
  // Supabase와 Cloudinary 둘 다 허용하도록 설정했습니다.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // 👈 Supabase 스토리지 허용 (핵심)
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary 허용 (혹시 몰라 유지)
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // 임시 이미지 허용
      },
      // 👇 기존의 '모든 사이트 허용'도 안전장치로 유지
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.trendit.ai.kr',
          },
        ],
        destination: 'https://trendit.ai.kr/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;