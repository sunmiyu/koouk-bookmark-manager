# Koouk Technical Stack

## Frontend
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS 4 with custom dark theme
- **Fonts**: Geist Sans & Geist Mono from Vercel
- **PWA**: Service workers, offline support

## Backend & Database
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with Google OAuth
- **Storage**: Supabase + localStorage fallback
- **Rate Limiting**: Upstash Redis
- **API Routes**: Next.js API routes (serverless)

## External APIs
- **Weather**: OpenWeatherMap API
- **Analytics**: Google Analytics 4 + Vercel Analytics
- **Stock Data**: Yahoo Finance API (free)
- **Music**: YouTube API for thumbnails

## Hosting & Deployment
- **Platform**: Vercel with edge functions
- **CDN**: Automatic via Vercel Edge
- **Domain**: koouk.im

## State Management
- **Context API**: Multiple React contexts for different features
- **Local Storage**: Primary data persistence with Supabase sync