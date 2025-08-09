import type { NextConfig } from "next";

// Bundle Analyzer 설정
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

// Security Headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self'",
      "connect-src 'self' https://api.openweathermap.org https://www.youtube.com https://www.google-analytics.com https://www.googletagmanager.com https://bpbfmitcwvqadtefgmek.supabase.co https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://openidconnect.googleapis.com",
      "frame-src 'self' https://www.youtube.com https://github.com https://dribbble.com",
      "media-src 'self' data: blob:"
    ].join('; ')
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@vercel/analytics', 'lucide-react', 'framer-motion']
  },
  
  // 빌드 성능 최적화 (swcMinify는 Next.js 15에서 deprecated)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  // Image domains for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withBundleAnalyzer(nextConfig);