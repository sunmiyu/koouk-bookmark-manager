import type { NextConfig } from "next";

// Security Headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live",
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
  // Disable ESLint during build for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
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
    optimizePackageImports: ['@vercel/analytics', 'lucide-react', 'framer-motion', '@supabase/supabase-js'],
    // Faster development mode
    ...(process.env.NODE_ENV === 'development' && {
      optimizeCss: false,
    })
  },
  
  // Exclude backup folder from build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // Simplified webpack configuration
  webpack: (config) => {
    // Exclude backup folder from compilation
    config.module.rules.push({
      test: /src\/_backup/,
      loader: 'ignore-loader'
    });
    return config;
  },
  
  // Build performance optimization (swcMinify is deprecated in Next.js 15)
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

export default nextConfig;