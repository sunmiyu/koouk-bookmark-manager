import type { NextConfig } from "next";

// Bundle Analyzer configuration
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
      turbo: {
        rules: {
          '*.svg': ['@svgr/webpack']
        }
      }
    })
  },
  
  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
  
  // Bundle optimization for Service Worker efficiency
  webpack: (config, { dev, isServer }) => {
    // Service Worker optimized bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Critical UI components - loaded first by Service Worker
          critical: {
            test: /[\\/]src[\\/](components[\\/](core|auth|ui)|lib[\\/](supabase|database|analytics))[\\/]/,
            name: 'critical',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Third-party vendors
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Shared components
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          // Analytics & non-critical features
          analytics: {
            test: /[\\/]src[\\/](lib[\\/]analytics|components[\\/]analytics)[\\/]/,
            name: 'analytics',
            chunks: 'all',
            priority: 3,
          },
        },
      }
      
      // Service Worker friendly module naming
      config.optimization.moduleIds = 'named'
      config.optimization.chunkIds = 'named'
    }
    return config
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

export default withBundleAnalyzer(nextConfig);