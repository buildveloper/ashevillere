import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAuthenticated } from "@/lib/admin-auth";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/server-rate-limit";
import { getRateLimitIdentifier } from "@/lib/sanitize";
import { safeError } from "@/lib/security-middleware";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

function getIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const isPublic = url.searchParams.get("public") === "true";

  // Auth check: either admin or public (rate-limited)
  if (!isPublic && !isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // CSRF check for admin uploads
  if (!isPublic) {
    const csrfCookie = request.cookies.get("csrf_token")?.value;
    const csrfHeader = request.headers.get("x-csrf-token");
    if (csrfCookie && csrfHeader && csrfCookie !== csrfHeader) {
      return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
    }
  }

  // Rate limit for public uploads
  if (isPublic) {
    const ip = getIP(request);
    const identifier = getRateLimitIdentifier(ip);
    const rateLimit = await checkRateLimit(identifier + ":upload");

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit) as Record<string, string>,
        }
      );
    }
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, AVIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 10MB" },
        { status: 400 }
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (err) {
    safeError("Image upload failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
