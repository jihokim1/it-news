import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 1MB 제한을 10MB로 늘려주는 설정
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 🟢 [이미지 설정 수정됨]
  // Cloudinary와 Placeholder 도메인을 명시적으로 허용하여 엑박 문제를 해결합니다.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // 👈 클라우디너리 이미지 필수 허용
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '**',
      },
      // 👇 기존에 쓰시던 '모든 사이트 허용'도 혹시 몰라 유지했습니다 (다른 뉴스 썸네일용)
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  // SEO 최적화를 위한 www -> non-www 리다이렉트 설정
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