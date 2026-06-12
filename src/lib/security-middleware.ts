// Security middleware — CSRF protection, input validation, and security checks
// Applied to all /api/* routes

import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getRateLimitHeaders,
  type RateLimitResult,
} from "./server-rate-limit";
import { getRateLimitIdentifier, sanitizeString } from "./sanitize";

type ApiHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://ashevillere.com",
  "https://www.ashevillere.com",
  "https://ashevillere.vercel.app",
];

const isDev = process.env.NODE_ENV === "development";

function getAllowedOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  if (isDev) return origin; // Allow all origins in dev
  if (ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
    return origin;
  }
  return null;
}

// CSRF token generation and validation
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("hex");
}

export function withSecurity(
  handler: ApiHandler,
  options?: {
    requireAuth?: boolean;
    rateLimit?: boolean;
    csrfProtection?: boolean;
    allowedMethods?: string[];
  }
): ApiHandler {
  return async (request: NextRequest, context?) => {
    const method = request.method.toUpperCase();
    const origin = getAllowedOrigin(request);

    // 1. Method validation
    if (options?.allowedMethods && !options.allowedMethods.includes(method)) {
      return NextResponse.json(
        { error: "Method not allowed" },
        {
          status: 405,
          headers: { Allow: options.allowedMethods.join(", ") },
        }
      );
    }

    // 2. CORS preflight
    if (method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin || "",
          "Access-Control-Allow-Methods": options?.allowedMethods?.join(", ") || "GET, POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 3. CSRF protection for state-changing operations
    if (options?.csrfProtection && method !== "GET" && method !== "HEAD") {
      const csrfCookie = request.cookies.get("csrf_token")?.value;
      const csrfHeader = request.headers.get("x-csrf-token");

      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return NextResponse.json(
          { error: "CSRF token validation failed" },
          { status: 403 }
        );
      }
    }

    // 4. Rate limiting
    let rateLimitResult: RateLimitResult | null = null;
    if (options?.rateLimit) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const userToken = request.cookies.get("avl_admin_token")?.value || null;
      const identifier = getRateLimitIdentifier(ip, userToken);
      rateLimitResult = await checkRateLimit(identifier);

      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          {
            status: 429,
            headers: {
              ...getRateLimitHeaders(rateLimitResult),
              "Retry-After": String(
                Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
              ),
            },
          }
        );
      }
    }

    // 5. Content-Type validation for POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.includes("application/json") && !contentType.includes("multipart/form-data")) {
        return NextResponse.json(
          { error: "Content-Type must be application/json" },
          { status: 415 }
        );
      }

      // Body size check (Next.js default is 4MB, we enforce 1MB for API routes)
      const contentLength = parseInt(
        request.headers.get("content-length") || "0",
        10
      );
      if (contentLength > 1_000_000) {
        return NextResponse.json(
          { error: "Request body too large" },
          { status: 413 }
        );
      }
    }

    // 6. Execute handler
    const response = await handler(request, context);

    // 7. Add security headers to response
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Set CSRF token cookie if not present
    if (!request.cookies.get("csrf_token")?.value) {
      const csrfToken = generateCSRFToken();
      response.cookies.set("csrf_token", csrfToken, {
        httpOnly: true,
        secure: !isDev,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }

    // Add rate limit headers if applicable
    if (rateLimitResult) {
      const headers = getRateLimitHeaders(rateLimitResult);
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }
    }

    return response;
  };
}

// Sensitive data scrubbing — prevent logging of secrets
export function scrubLogData(message: string): string {
  return message
    .replace(/gsk_[a-zA-Z0-9]+/g, "[REDACTED_API_KEY]")
    .replace(/Bearer\s+[a-zA-Z0-9_-]+/g, "Bearer [REDACTED]")
    .replace(/password["\s:=]+[^,\s}]+/gi, 'password=[REDACTED]');
}

// Safe console wrapper that scrubs sensitive data
export function safeLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === "production") {
    const scrubbed = args.map((arg) => {
      if (typeof arg === "string") return scrubLogData(arg);
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.parse(scrubLogData(JSON.stringify(arg)));
        } catch {
          return "[Object]";
        }
      }
      return arg;
    });
    console.log(...scrubbed);
  } else {
    console.log(...args);
  }
}

export function safeError(message: string, error?: unknown): void {
  const errorMsg = error instanceof Error ? error.message : String(error || "");
  safeLog(`[ERROR] ${scrubLogData(message)}: ${scrubLogData(errorMsg)}`);
}
