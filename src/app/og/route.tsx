import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "AshevilleRE";
    const subtitle = searchParams.get("subtitle") || "";
    const tag = searchParams.get("tag") || "";

    // Font loading skipped — uses system Inter fallback
    const interSemiBold = null;
    const interRegular = null;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#0F172A",
            padding: 80,
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(16,185,129,0.08) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(34,211,238,0.06) 0%, transparent 50%)",
          }}
        >
          {/* Top tag */}
          {tag && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 9999,
                border: "1px solid rgba(16,185,129,0.3)",
                backgroundColor: "rgba(16,185,129,0.08)",
                marginBottom: 32,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#34D399",
                }}
              >
                {tag}
              </span>
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: subtitle ? 64 : 72,
              fontWeight: 700,
              color: "#F8FAFC",
              lineHeight: 1.15,
              maxWidth: "90%",
              fontFamily: "Inter",
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: 32,
                fontWeight: 400,
                color: "#94A3B8",
                marginTop: 20,
                maxWidth: "75%",
                lineHeight: 1.4,
                fontFamily: "Inter",
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Bottom: Logo + URL */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 60,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #10B981, #22D3EE)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#0F172A",
                }}
              >
                A
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#F8FAFC",
                    letterSpacing: "-0.5px",
                  }}
                >
                  AshevilleRE
                </span>
                <span
                  style={{
                    fontSize: 18,
                    color: "#64748B",
                    fontWeight: 400,
                  }}
                >
                  Premium Real Estate Intelligence
                </span>
              </div>
            </div>
            <div
              style={{
                fontSize: 20,
                color: "#475569",
                fontWeight: 500,
              }}
            >
              ashevillere.com
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          ...(interSemiBold
            ? [
                {
                  name: "Inter",
                  data: interSemiBold,
                  style: "normal" as const,
                  weight: 700 as const,
                },
              ]
            : []),
          ...(interRegular
            ? [
                {
                  name: "Inter",
                  data: interRegular,
                  style: "normal" as const,
                  weight: 400 as const,
                },
              ]
            : []),
        ],
      }
    );
  } catch {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
