declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      parameters?: Record<string, string>
    ) => void;
  }
}

export {}