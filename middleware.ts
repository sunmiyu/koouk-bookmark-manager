import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'ko'],

  // Used when no locale matches
  defaultLocale: 'ko',

  // Automatically detect user's locale based on:
  // 1. Accept-Language header (browser preference)
  // 2. User's location (if available)
  localeDetection: true,

  // Don't prefix the default locale in URLs
  localePrefix: 'as-needed'
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ko|en)/:path*']
}