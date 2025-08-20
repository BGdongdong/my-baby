import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', 
        hostname: '*.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.20250530.space',
        port: '',
        pathname: '/**',
      },
      // 新增允许 baby.mvpbook.cn 域名的配置
      {
        protocol: 'https',
        hostname: 'baby.mvpbook.cn', // 这里直接写完整域名（不需要*，因为是固定域名）
        port: '',
        pathname: '/**', // 允许该域名下的所有路径
      }
    ],
  },
};

export default nextConfig;
