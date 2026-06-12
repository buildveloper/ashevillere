// Global type declarations for third-party scripts
export {};

declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set" | "consent",
      targetId?: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
