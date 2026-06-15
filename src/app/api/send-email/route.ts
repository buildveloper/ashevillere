import { NextRequest, NextResponse } from "next/server";
import { sanitizeString, sanitizeEmail, sanitizePositiveInt, sanitizeObject, getRateLimitIdentifier } from "@/lib/sanitize";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/server-rate-limit";
import { saveContactMessage, saveFeedback, type ContactMessage, type FeedbackEntry } from "@/lib/admin-store";
import { sendSellerInquiryEmail, sendFeedbackEmail } from "@/lib/resend";
import { safeError } from "@/lib/security-middleware";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getIP(request);
  const identifier = getRateLimitIdentifier(ip);
  const rateLimit = await checkRateLimit(identifier + ":send-email", 5, 60 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimit, 5) as Record<string, string>,
      }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const sanitized = sanitizeObject(body) as Record<string, unknown>;
  const type = sanitizeString(sanitized.type, 20);

  // ─── Contact Seller Inquiry ───────────────────────────────────────────
  if (type === "contact-seller") {
    const name = sanitizeString(sanitized.name, 100);
    const email = sanitizeEmail(sanitized.email);
    const phone = sanitizeString(sanitized.phone, 20);
    const message = sanitizeString(sanitized.message, 2000);
    const listingId = sanitizeString(sanitized.listingId, 100);
    const listingAddress = sanitizeString(sanitized.listingAddress, 300);
    const listingPrice = sanitizeString(sanitized.listingPrice, 50);
    const listingUrl = sanitizeString(sanitized.listingUrl, 500);

    if (!name || !email || !message) {
      return json({ error: "Name, email, and message are required." }, 400);
    }

    const entry: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      phone,
      message,
      listingId,
      listingAddress,
      listingPrice,
      submittedAt: new Date().toISOString(),
    };

    saveContactMessage(entry);

    const emailResult = await sendSellerInquiryEmail({
      name,
      email,
      phone,
      message,
      listingAddress,
      listingPrice,
      listingUrl,
    });

    if (!emailResult.ok) {
      safeError("Failed to send contact seller email", emailResult.error);
    }

    return json({ ok: true, id: entry.id });
  }

  // ─── Feedback ─────────────────────────────────────────────────────────
  if (type === "feedback") {
    const rating = sanitizePositiveInt(sanitized.rating, 5);
    const message = sanitizeString(sanitized.message, 2000);
    const email = sanitizeEmail(sanitized.email);

    if (rating < 1 || rating > 5) {
      return json({ error: "Rating must be between 1 and 5." }, 400);
    }

    const entry: FeedbackEntry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      rating,
      message,
      email: email || "",
      submittedAt: new Date().toISOString(),
    };

    saveFeedback(entry);

    const emailResult = await sendFeedbackEmail({
      rating,
      message,
      email: email || "",
    });

    if (!emailResult.ok) {
      safeError("Failed to send feedback email", emailResult.error);
    }

    return json({ ok: true, id: entry.id });
  }

  return json({ error: "Invalid type. Use 'contact-seller' or 'feedback'." }, 400);
}

export async function GET(request: NextRequest) {
  return POST(request);
}
