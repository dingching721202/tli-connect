import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  // 添加图片域名配置
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig