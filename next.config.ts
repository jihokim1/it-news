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
  // 여기가 핵심입니다. unoptimized: true를 켜서 Vercel 사용량을 0으로 만듭니다.
  images: {
    unoptimized: true, // 👈 [필수] 이걸 켜야 Vercel이 카운팅을 안 합니다. (무제한 무료)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 모든 외부 이미지 허용
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // (혹시 몰라 유지)
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // 👇 기존의 '모든 사이트 허용'도 안전장치로 유지
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