import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 👈 1MB 제한을 10MB로 늘려주는 설정
    },
  },
};

export default nextConfig;