import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/lib/report-generator";
import {
  getReportFilename,
  type ReportType,
  type ReportPayload,
} from "@/lib/report-templates";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/server-rate-limit";
import {
  sanitizeString,
  sanitizeSlug,
  sanitizePositiveInt,
  sanitizeObject,
  getRateLimitIdentifier,
} from "@/lib/sanitize";
import { safeError } from "@/lib/security-middleware";

const VALID_REPORT_TYPES: ReportType[] = [
  "market-report",
  "neighborhood-report",
  "str-report",
  "relocation-report",
  "home-value-report",
];

function getIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getIP(request);
  const identifier = getRateLimitIdentifier(ip);
  const rateLimit = await checkRateLimit(identifier + ":pdf");

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: {
          ...getRateLimitHeaders(rateLimit),
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const reportType = sanitizeString(body.reportType, 50) as ReportType;
    const rawData = sanitizeObject(body.data || {}, 5) as Record<string, unknown>;

    if (!reportType || !body.data) {
      return NextResponse.json(
        { error: "reportType and data are required" },
        { status: 400 }
      );
    }

    if (!VALID_REPORT_TYPES.includes(reportType)) {
      return NextResponse.json(
        { error: `Invalid reportType. Must be one of: ${VALID_REPORT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Sanitize common data fields
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rawData)) {
      if (typeof value === "string") {
        data[key] = sanitizeString(value, 5000);
      } else if (typeof value === "number" && Number.isFinite(value)) {
        data[key] = value;
      } else if (Array.isArray(value)) {
        data[key] = value.slice(0, 50);
      } else if (typeof value === "object" && value !== null) {
        data[key] = sanitizeObject(value, 3);
      } else {
        data[key] = value;
      }
    }

    // Add generatedAt timestamp
    data.generatedAt = new Date().toISOString();

    const payload = data as unknown as ReportPayload;
    const { buffer } = await generatePDF(reportType, payload);
    const filename = getReportFilename(reportType, payload);

    // Validate filename (no path traversal)
    const safeFilename = filename.replace(/[/\\:*?"<>|]/g, "-").slice(0, 200);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store, max-age=0",
        ...getRateLimitHeaders(rateLimit),
      },
    });
  } catch (error) {
    safeError("PDF generation error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 }
    );
  }
}
