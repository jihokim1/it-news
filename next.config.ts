import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 👈 1MB 제한을 10MB로 늘려주는 설정
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint 설정은 삭제했습니다 (빨간줄 원인 제거)
  
  // 이미지 허용 설정
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  // 👇 SEO 최적화를 위한 www -> non-www 리다이렉트 설정
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
        permanent: true, // 301 리다이렉트로 검색 엔진 점수를 trendit.ai.kr로 통합합니다.
      },
    ];
  },
};

export default nextConfig;