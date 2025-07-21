import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  // 添加圖片域名配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        port: '',
        pathname: '/avatar/**',
      },
    ],
  },
  // 國際化設定
  i18n: {
    locales: ['zh-TW'],
    defaultLocale: 'zh-TW',
  },
}

export default nextConfig