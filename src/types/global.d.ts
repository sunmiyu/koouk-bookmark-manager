declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'consent',
      targetId: string | Date | 'default' | 'update',
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export {}