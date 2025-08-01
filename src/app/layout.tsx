import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SecurityMonitor from "@/components/SecurityMonitor";
import CookieBanner from "@/components/CookieBanner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserPlanProvider } from "@/contexts/UserPlanContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MiniFunctionsProvider } from "@/contexts/MiniFunctionsContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { TodoProvider } from "@/contexts/TodoContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koouk - Personal Life Hub",
  description: "Your personal life hub - manage bookmarks, daily info, and lifestyle in one place | 개인 라이프 허브 - 북마크, 일상 정보, 라이프스타일을 한 곳에서 관리",
  manifest: "/manifest.json",
  metadataBase: new URL('https://koouk.im'),
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Koouk - Personal Life Hub"
  },
  openGraph: {
    title: "Koouk - Personal Life Hub",
    description: "All your bookmarks in one place | 모든 북마크를 한 곳에서",
    type: "website",
    locale: "en_US",
    alternateLocale: "ko_KR",
    url: "https://koouk.im",
    siteName: "Koouk",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Koouk - Personal Life Hub"
      }
    ]
  },
  twitter: {
    card: "summary",
    title: "Koouk - Personal Life Hub",
    description: "All your bookmarks in one place | 모든 북마크를 한 곳에서",
    images: ["/icon-512x512.png"]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <AuthProvider>
            <UserPlanProvider>
              <MiniFunctionsProvider>
                <ContentProvider>
                  <TodoProvider>
                    <SearchProvider>
                      <SecurityMonitor />
                      {children}
                      <CookieBanner />
                    </SearchProvider>
                  </TodoProvider>
                </ContentProvider>
              </MiniFunctionsProvider>
            </UserPlanProvider>
          </AuthProvider>
        </LanguageProvider>
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Register Enhanced Service Worker for PWA
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('Service Worker registered successfully:', registration.scope);
                    
                    // Enable background sync for alarms
                    if ('sync' in window.ServiceWorkerRegistration.prototype) {
                      registration.sync.register('alarm-check');
                      console.log('Background sync registered for alarms');
                    }
                  })
                  .catch(function(error) {
                    console.log('Service Worker registration failed:', error);
                  });
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
