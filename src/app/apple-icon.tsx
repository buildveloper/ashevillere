import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon (180×180) for iOS home screen bookmarks.
 * Same brand mark as the favicon, slightly larger to keep
 * the house crisp at high DPI.
 */
export default function AppleIcon() {
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
          borderRadius: 38,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width="180"
          height="180"
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            d="M0 23 L8 14 L13 19 L19 11 L25 17 L32 21 L32 32 L0 32 Z"
            fill="rgba(255,255,255,0.18)"
          />
        </svg>
        <svg
          viewBox="0 0 24 24"
          width="115"
          height="115"
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
