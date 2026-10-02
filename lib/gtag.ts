declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fires the Google Ads "app_download_click" event. Safe to call even if gtag hasn't loaded yet. */
export function trackSignupClick(label: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "app_download_click", {
    event_category: "engagement",
    event_label: label,
  });
}
