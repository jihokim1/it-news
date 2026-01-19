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
};

export default nextConfig;