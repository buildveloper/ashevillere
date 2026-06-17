import { ImageResponse } from "next/og";

// Route segment config — render at edge, never cache.
export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * App favicon — AshevilleRE brand mark.
 * Emerald→cyan gradient background with a white house silhouette
 * over a translucent mountain range. Rendered at 32×32 by default;
 * Next.js also auto-serves the apple-icon variant at 180×180.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #059669 0%, #06b6d4 100%)",
          borderRadius: 7,
          position: "relative",
          overflow: "hidden",
          fontSize: 0,
        }}
      >
        {/* Mountain backdrop */}
        <svg
          viewBox="0 0 32 32"
          width="32"
          height="32"
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            d="M0 23 L8 14 L13 19 L19 11 L25 17 L32 21 L32 32 L0 32 Z"
            fill="rgba(255,255,255,0.18)"
          />
        </svg>
        {/* House */}
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          style={{ position: "relative" }}
        >
          <path d="M3 11 L12 3 L21 11 L19 11 L19 20 L5 20 L5 11 Z" fill="#ffffff" />
          <rect x="10" y="14" width="4" height="6" rx="0.5" fill="#059669" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
