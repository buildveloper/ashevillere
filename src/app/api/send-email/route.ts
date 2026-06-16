// Email API — handles both public (rate-limited) and admin (auth + CSRF) email sends.
//
// Public types:
//   - "contact-seller"  : buyer inquiry from listing page → store + notify owner
//   - "feedback"        : star-rating feedback from footer
//   - "test-email"      : admin-only test of Resend configuration
//
// Admin types (require auth):
//   - "listing-received" : confirmation to the submitter
//   - "listing-approved" : approval + live notification
//   - "listing-rejected" : rejection with reason
//   - "forward-inquiry"  : forward a buyer message to the actual seller

import { NextRequest, NextResponse } from "next/server";
import {
  sanitizeString,
  sanitizeEmail,
  sanitizePositiveInt,
  sanitizeObject,
  getRateLimitIdentifier,
} from "@/lib/sanitize";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/server-rate-limit";
import {
  saveContactMessage,
  saveFeedback,
  getContactMessageById,
  markContactMessageForwarded,
  type ContactMessage,
  type FeedbackEntry,
} from "@/lib/admin-store";
import {
  sendSellerInquiryEmail,
  sendFeedbackEmail,
  sendListingReceivedEmail,
  sendListingApprovedEmail,
  sendListingRejectedEmail,
  sendForwardInquiryToSellerEmail,
  isResendConfigured,
  getResendConfig,
  buildSellerInquiryHtml,
} from "@/lib/resend";
import { isAuthenticated } from "@/lib/admin-auth";
import { safeLog, safeError } from "@/lib/security-middleware";

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

const PUBLIC_TYPES = new Set(["contact-seller", "feedback", "test-email"]);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const sanitized = sanitizeObject(body) as Record<string, unknown>;
  const type = sanitizeString(sanitized.type, 40);

  // Rate limit all public sends by IP.
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

  // ─── Public: Contact Seller Inquiry ─────────────────────────────────
  if (type === "contact-seller") {
    const name = sanitizeString(sanitized.name, 100);
    const email = sanitizeEmail(sanitized.email);
    const phone = sanitizeString(sanitized.phone, 20);
    const message = sanitizeString(sanitized.message, 2000);
    const listingId = sanitizeString(sanitized.listingId, 100);
    const listingAddress = sanitizeString(sanitized.listingAddress, 300);
    const listingPriceRaw = sanitized.listingPrice;
    const listingPrice =
      typeof listingPriceRaw === "number"
        ? listingPriceRaw
        : sanitizeString(listingPriceRaw, 50);
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
      listingPrice: typeof listingPrice === "string" ? listingPrice : String(listingPrice),
      listingUrl: listingUrl || undefined,
      submittedAt: new Date().toISOString(),
    };

    saveContactMessage(entry);
    safeLog("Contact seller inquiry received", {
      id: entry.id,
      listingId,
      listingAddress,
    });

    // Send to site owner (chris@ashevillere.com). The admin can later
    // forward to the actual seller via the Inquiries panel.
    const emailResult = await sendSellerInquiryEmail({
      buyerName: name,
      buyerEmail: email,
      buyerPhone: phone,
      message,
      listingId,
      listingAddress,
      listingPrice: entry.listingPrice,
      listingUrl: listingUrl || undefined,
    });

    if (!emailResult.ok) {
      safeError("Failed to send contact-seller email to owner", emailResult.error);
      // We still return ok=true because the message is saved for the admin
      // to see, but we flag that the email failed so the caller can show a
      // softer success state.
      return json({
        ok: true,
        id: entry.id,
        emailDelivered: false,
        emailError: emailResult.error,
      });
    }

    return json({ ok: true, id: entry.id, emailDelivered: true });
  }

  // ─── Public: Feedback ───────────────────────────────────────────────
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
      return json({ ok: true, id: entry.id, emailDelivered: false, emailError: emailResult.error });
    }

    return json({ ok: true, id: entry.id, emailDelivered: true });
  }

  // ─── Public: Test Email (admin only — auth required) ────────────────
  if (type === "test-email") {
    if (!isAuthenticated(request)) {
      return json({ error: "Unauthorized" }, 401);
    }
    const to = sanitizeEmail(sanitized.to);
    if (!to) return json({ error: "Valid 'to' email is required" }, 400);

    const config = getResendConfig();
    if (!config.configured) {
      return json(
        {
          ok: false,
          error: "RESEND_API_KEY is not configured. Add it to your environment variables.",
          config,
        },
        503
      );
    }

    const { getResendClient } = await import("@/lib/resend");
    try {
      const resend = getResendClient();
      const result = await resend.emails.send({
        from: config.from,
        to: [to],
        subject: `AshevilleRE test email — ${new Date().toLocaleString("en-US")}`,
        html: buildSellerInquiryHtml({
          buyerName: "Test Sender",
          buyerEmail: to,
          buyerPhone: "(828) 555-0100",
          message:
            "This is a test email from the AshevilleRE admin dashboard. If you're reading this, Resend is configured correctly and the ashevillere.com sending domain is verified.",
          listingId: "test-listing",
          listingAddress: "123 Test Lane, Asheville, NC 28801",
          listingPrice: 425000,
          listingUrl: `${config.siteUrl}/homes-for-sale`,
        }),
      });

      if (result.error) {
        return json(
          { ok: false, error: result.error.message, config },
          502
        );
      }

      safeLog("Test email sent", { to, id: result.data?.id });
      return json({ ok: true, id: result.data?.id, config });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      safeError("Test email failed", err);
      return json({ ok: false, error: message, config }, 500);
    }
  }

  // ─── Admin: Listing Received (submitter confirmation) ───────────────
  if (type === "listing-received") {
    if (!isAuthenticated(request)) {
      return json({ error: "Unauthorized" }, 401);
    }
    const contactName = sanitizeString(sanitized.contactName, 100);
    const contactEmail = sanitizeEmail(sanitized.contactEmail);
    const trackingNumber = sanitizeString(sanitized.trackingNumber, 50);
    const title = sanitizeString(sanitized.title, 200);
    const address = sanitizeString(sanitized.address, 300);
    const price = sanitized.price;

    if (!contactEmail || !trackingNumber) {
      return json({ error: "contactEmail and trackingNumber are required" }, 400);
    }

    const result = await sendListingReceivedEmail({
      contactName,
      contactEmail,
      trackingNumber,
      listingTitle: title,
      listingAddress: address,
      listingPrice: price as number | string,
    });

    if (!result.ok) {
      safeError("listing-received email failed", result.error);
      return json({ ok: false, error: result.error }, 502);
    }
    return json({ ok: true, id: result.id });
  }

  // ─── Admin: Listing Approved ────────────────────────────────────────
  if (type === "listing-approved") {
    if (!isAuthenticated(request)) {
      return json({ error: "Unauthorized" }, 401);
    }
    const contactName = sanitizeString(sanitized.contactName, 100);
    const contactEmail = sanitizeEmail(sanitized.contactEmail);
    const trackingNumber = sanitizeString(sanitized.trackingNumber, 50);
    const title = sanitizeString(sanitized.title, 200);
    const address = sanitizeString(sanitized.address, 300);
    const price = sanitized.price;
    const listingUrl = sanitizeString(sanitized.listingUrl, 500);

    if (!contactEmail || !trackingNumber) {
      return json({ error: "contactEmail and trackingNumber are required" }, 400);
    }

    const result = await sendListingApprovedEmail({
      contactName,
      contactEmail,
      trackingNumber,
      listingTitle: title,
      listingAddress: address,
      listingPrice: price as number | string,
      listingUrl: listingUrl || undefined,
    });

    if (!result.ok) {
      safeError("listing-approved email failed", result.error);
      return json({ ok: false, error: result.error }, 502);
    }
    return json({ ok: true, id: result.id });
  }

  // ─── Admin: Listing Rejected ────────────────────────────────────────
  if (type === "listing-rejected") {
    if (!isAuthenticated(request)) {
      return json({ error: "Unauthorized" }, 401);
    }
    const contactName = sanitizeString(sanitized.contactName, 100);
    const contactEmail = sanitizeEmail(sanitized.contactEmail);
    const trackingNumber = sanitizeString(sanitized.trackingNumber, 50);
    const title = sanitizeString(sanitized.title, 200);
    const reason = sanitizeString(sanitized.reason, 1000) ||
      "Our team wasn't able to approve this listing. Please review your submission and feel free to reply with questions.";

    if (!contactEmail || !trackingNumber) {
      return json({ error: "contactEmail and trackingNumber are required" }, 400);
    }

    const result = await sendListingRejectedEmail({
      contactName,
      contactEmail,
      trackingNumber,
      listingTitle: title,
      reason,
    });

    if (!result.ok) {
      safeError("listing-rejected email failed", result.error);
      return json({ ok: false, error: result.error }, 502);
    }
    return json({ ok: true, id: result.id });
  }

  // ─── Admin: Forward Inquiry to Seller ───────────────────────────────
  if (type === "forward-inquiry") {
    if (!isAuthenticated(request)) {
      return json({ error: "Unauthorized" }, 401);
    }
    const inquiryId = sanitizeString(sanitized.inquiryId, 100);
    const sellerEmailOverride = sanitizeEmail(sanitized.sellerEmail);

    if (!inquiryId) {
      return json({ error: "inquiryId is required" }, 400);
    }

    const inquiry = getContactMessageById(inquiryId);
    if (!inquiry) {
      return json({ error: "Inquiry not found" }, 404);
    }

    const sellerEmail = sellerEmailOverride || inquiry.sellerEmail;
    if (!sellerEmail) {
      return json(
        {
          error:
            "No seller email is associated with this listing. Provide 'sellerEmail' or add one to the listing/submission.",
        },
        400
      );
    }

    const result = await sendForwardInquiryToSellerEmail({
      sellerEmail,
      sellerName: inquiry.sellerName,
      buyerName: inquiry.name,
      buyerEmail: inquiry.email,
      buyerPhone: inquiry.phone,
      message: inquiry.message,
      listingAddress: inquiry.listingAddress,
      listingPrice: inquiry.listingPrice,
      listingUrl: inquiry.listingUrl,
    });

    if (!result.ok) {
      safeError("forward-inquiry email failed", result.error);
      return json({ ok: false, error: result.error }, 502);
    }

    const updated = markContactMessageForwarded(inquiry.id);
    return json({ ok: true, id: result.id, inquiry: updated });
  }

  return json(
    {
      error: `Invalid type "${type}". Allowed: ${Array.from(PUBLIC_TYPES).join(", ")}, listing-received, listing-approved, listing-rejected, forward-inquiry`,
    },
    400
  );
}

export async function GET(request: NextRequest) {
  // GET is read-only — return Resend config status (handy for a health check).
  if (!isAuthenticated(request)) {
    return json({ error: "Unauthorized" }, 401);
  }
  const config = getResendConfig();
  return json({ ok: true, config, isConfigured: isResendConfigured() });
}
