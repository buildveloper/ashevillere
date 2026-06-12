"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// Track page views
function pageView(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  try {
    window.gtag?.("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  } catch {}
}

// Track custom events
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;
  try {
    window.gtag?.("event", eventName, params);
  } catch {}
}

// Analytics component with consent-respecting GA4
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const consentRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("analytics_consent");
    if (stored === "true") consentRef.current = true;
  }, []);

  useEffect(() => {
    if (!consentRef.current) return;
    const url = searchParams?.size
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    pageView(url);
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* Consent defaults — grant analytics by default for privacy-first */}
      <Script
        id="ga-consent"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'granted',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
            });
          `,
        }}
      />
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="ga-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
              anonymize_ip: true,
            });
          `,
        }}
      />
    </>
  );
}

// ─── Analytics Event Types (typed for consistency) ─────────────────────

export const AnalyticsEvents = {
  // Tool usage
  HOME_VALUE_ESTIMATOR: "home_value_estimator_used",
  MORTGAGE_CALCULATOR: "mortgage_calculator_used",
  RELOCATION_CHECKLIST: "relocation_checklist_used",

  // Chatbot
  CHATBOT_OPENED: "chatbot_opened",
  CHATBOT_MESSAGE_SENT: "chatbot_message_sent",
  CHATBOT_SUGGESTION_CLICKED: "chatbot_suggestion_clicked",

  // PDF
  PDF_GENERATION_STARTED: "pdf_generation_started",
  PDF_GENERATION_COMPLETED: "pdf_generation_completed",
  PDF_DOWNLOADED: "pdf_downloaded",

  // Navigation
  NEIGHBORHOOD_VIEWED: "neighborhood_viewed",
  BLOG_POST_VIEWED: "blog_post_viewed",
  MARKET_REPORT_VIEWED: "market_report_viewed",
  STR_INSIGHTS_VIEWED: "str_insights_viewed",

  // Affiliate
  AFFILIATE_CLICK: "affiliate_link_clicked",

  // Search
  SITE_SEARCH: "site_search_performed",

  // Listings
  LISTING_VIEWED: "listing_viewed",
  LISTING_SUBMITTED: "listing_submitted",
} as const;
