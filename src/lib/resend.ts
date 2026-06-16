// Resend email integration for AshevilleRE.
// Centralized client, reusable HTML templates, and typed send helpers.
//
// Domain setup checklist (Vercel + Resend):
//   1. Add RESEND_API_KEY to Vercel env (and .env.local).
//   2. In Resend dashboard → Domains → add `ashevillere.com`.
//   3. Add the DKIM/SPF records Resend provides to your DNS.
//   4. Once verified, the FROM_ADDRESS below will be accepted.
//
// Until the domain is verified, Resend returns 403. Callers receive
// { ok: false, error } so the rest of the app can degrade gracefully.

import { Resend } from "resend";

// ─── Configuration ──────────────────────────────────────────────────────────

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || "AshevilleRE <no-reply@ashevillere.com>";
const OWNER_EMAIL =
  process.env.OWNER_EMAIL || "chris@ashevillere.com";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ashevillere.com";
const SITE_NAME = "AshevilleRE";

// ─── Client (lazy singleton) ────────────────────────────────────────────────

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "your_resend_api_key_here") {
    throw new Error(
      "RESEND_API_KEY is not configured. Add it to .env.local and Vercel environment variables."
    );
  }
  resendClient = new Resend(apiKey);
  return resendClient;
}

export function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && key !== "your_resend_api_key_here");
}

// ─── Shared HTML helpers ────────────────────────────────────────────────────

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(input: string): string {
  return escapeHtml(input).replace(/\n/g, "<br>");
}

function formatPrice(price: number | string): string {
  const n = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(n) || n <= 0) return "Price on request";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(n).toLocaleString()}`;
}

function formatDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Wraps inner HTML in the standard AshevilleRE email shell.
 * All email-client safe (table-based, inline styles, no JS).
 */
function wrapEmail(opts: {
  heading: string;
  intro: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  accent?: "emerald" | "cyan" | "amber" | "red" | "violet";
}): string {
  const accent = opts.accent || "emerald";
  const gradients: Record<string, string> = {
    emerald: "linear-gradient(135deg,#059669,#06b6d4)",
    cyan: "linear-gradient(135deg,#0891b2,#6366f1)",
    amber: "linear-gradient(135deg,#d97706,#f59e0b)",
    red: "linear-gradient(135deg,#dc2626,#f97316)",
    violet: "linear-gradient(135deg,#7c3aed,#06b6d4)",
  };

  const cta = opts.ctaUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px 0;">
         <tr>
           <td style="background:${gradients[accent]};border-radius:10px;">
             <a href="${opts.ctaUrl}" target="_blank" rel="noopener noreferrer"
                style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">
               ${opts.ctaLabel || "View on AshevilleRE"}
             </a>
           </td>
         </tr>
       </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(15,23,42,0.06);">
          <tr>
            <td style="background:${gradients[accent]};padding:32px 24px;text-align:center;">
              <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,0.85);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
                ${SITE_NAME}
              </div>
              <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;line-height:1.25;">${escapeHtml(opts.heading)}</h1>
              <p style="color:rgba(255,255,255,0.92);font-size:14px;margin:8px 0 0 0;line-height:1.5;">${escapeHtml(opts.intro)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px 24px;font-size:14px;line-height:1.65;color:#334155;">
              ${opts.body}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="background:#f1f5f9;padding:18px 24px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="font-size:12px;color:#94a3b8;margin:0;">
                ${SITE_NAME} · ${formatDate()}
              </p>
              <p style="font-size:11px;color:#cbd5e1;margin:6px 0 0 0;">
                You&apos;re receiving this because you submitted a listing or inquiry on ${SITE_NAME}.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Public: shared types ───────────────────────────────────────────────────

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

interface EmailSendOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  /** If true, also CC the site owner (chris@ashevillere.com). */
  bccOwner?: boolean;
}

async function sendEmail(opts: EmailSendOptions): Promise<SendResult> {
  if (!isResendConfigured()) {
    const msg = "RESEND_API_KEY is not configured";
    console.error("[Resend] " + msg);
    return { ok: false, error: msg };
  }

  try {
    const resend = getResendClient();
    const to = Array.isArray(opts.to) ? opts.to : [opts.to];
    const finalRecipients = opts.bccOwner
      ? Array.from(new Set([...to, OWNER_EMAIL]))
      : to;

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: finalRecipients,
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });

    if (result.error) {
      const msg = result.error.message || "Resend returned an error";
      console.error("[Resend] Send failed:", { to: finalRecipients, subject: opts.subject, error: msg });
      return { ok: false, error: msg };
    }

    return { ok: true, id: result.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("[Resend] Exception:", { to: opts.to, subject: opts.subject, message });
    return { ok: false, error: message };
  }
}

// ─── Template: listing received (submitter confirmation) ────────────────────

export interface ListingReceivedData {
  contactName: string;
  contactEmail: string;
  trackingNumber: string;
  listingTitle: string;
  listingAddress: string;
  listingPrice: number | string;
}

export function buildListingReceivedHtml(data: ListingReceivedData): string {
  const body = `
    <p style="margin:0 0 16px 0;">Hi ${escapeHtml(data.contactName || "there")},</p>
    <p style="margin:0 0 20px 0;">
      Thanks for submitting your home to <strong>${SITE_NAME}</strong>! We&apos;ve received your
      listing and our team is reviewing it now.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:10px;padding:18px;margin:0 0 20px 0;">
      <tr>
        <td>
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;">Tracking Number</p>
          <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:18px;font-weight:700;color:#059669;">${escapeHtml(data.trackingNumber)}</p>
        </td>
      </tr>
    </table>

    <h2 style="font-size:15px;color:#0f172a;margin:24px 0 8px 0;font-weight:600;">Your Listing</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
      <tr><td style="padding:4px 0;font-size:13px;color:#64748b;width:90px;">Title</td>
          <td style="padding:4px 0;font-size:14px;color:#0f172a;font-weight:500;">${escapeHtml(data.listingTitle)}</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Address</td>
          <td style="padding:4px 0;font-size:14px;color:#0f172a;font-weight:500;">${escapeHtml(data.listingAddress)}</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#64748b;">Price</td>
          <td style="padding:4px 0;font-size:14px;color:#059669;font-weight:700;">${formatPrice(data.listingPrice)}</td></tr>
    </table>

    <h2 style="font-size:15px;color:#0f172a;margin:24px 0 8px 0;font-weight:600;">What happens next</h2>
    <ol style="margin:0 0 8px 0;padding-left:20px;color:#334155;font-size:14px;line-height:1.7;">
      <li>Our team reviews your listing for quality and accuracy (typically within 24–48 hours).</li>
      <li>Once approved, your home goes live on ${SITE_NAME}.com for thousands of buyers to see.</li>
      <li>You&apos;ll get an email here the moment it&apos;s published.</li>
    </ol>

    <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">
      Questions? Reply to this email — we read every message.
    </p>
  `;

  return wrapEmail({
    heading: "We got your listing!",
    intro: "Your home is in review and will be live within 24–48 hours.",
    body,
    accent: "emerald",
  });
}

export async function sendListingReceivedEmail(data: ListingReceivedData): Promise<SendResult> {
  if (!data.contactEmail) {
    return { ok: false, error: "Submitter email is missing" };
  }
  return sendEmail({
    to: data.contactEmail,
    subject: `We received your listing — ${data.trackingNumber}`,
    html: buildListingReceivedHtml(data),
    replyTo: OWNER_EMAIL,
  });
}

// ─── Template: listing approved ─────────────────────────────────────────────

export interface ListingApprovedData {
  contactName: string;
  contactEmail: string;
  trackingNumber: string;
  listingTitle: string;
  listingAddress: string;
  listingPrice: number | string;
  listingUrl?: string;
}

export function buildListingApprovedHtml(data: ListingApprovedData): string {
  const url = data.listingUrl || `${SITE_URL}/homes-for-sale`;
  const body = `
    <p style="margin:0 0 16px 0;">Hi ${escapeHtml(data.contactName || "there")},</p>
    <p style="margin:0 0 20px 0;">
      Great news — <strong>your listing has been approved and is now live</strong> on ${SITE_NAME}!
      Buyers can see it right now and start reaching out to you.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:18px;margin:0 0 20px 0;">
      <tr>
        <td>
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#047857;">✓ Approved &amp; Live</p>
          <p style="margin:0;font-size:14px;color:#065f46;font-weight:500;">
            <strong>${escapeHtml(data.listingTitle)}</strong><br>
            ${escapeHtml(data.listingAddress)} · ${formatPrice(data.listingPrice)}
          </p>
        </td>
      </tr>
    </table>

    <h2 style="font-size:15px;color:#0f172a;margin:24px 0 8px 0;font-weight:600;">What to do next</h2>
    <ul style="margin:0 0 8px 0;padding-left:20px;color:#334155;font-size:14px;line-height:1.7;">
      <li>Share the listing link with friends, family, and on social media.</li>
      <li>Watch your inbox — buyer inquiries are forwarded to you automatically.</li>
      <li>Respond quickly to keep momentum and book showings.</li>
    </ul>

    <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">
      Tracking number: <strong>${escapeHtml(data.trackingNumber)}</strong>
    </p>
  `;

  return wrapEmail({
    heading: "Your listing is live! 🎉",
    intro: "Approved and published to AshevilleRE.com",
    body,
    ctaLabel: "View Live Listing",
    ctaUrl: url,
    accent: "emerald",
  });
}

export async function sendListingApprovedEmail(data: ListingApprovedData): Promise<SendResult> {
  if (!data.contactEmail) {
    return { ok: false, error: "Submitter email is missing" };
  }
  return sendEmail({
    to: data.contactEmail,
    subject: `Your listing is live on ${SITE_NAME}!`,
    html: buildListingApprovedHtml(data),
    replyTo: OWNER_EMAIL,
  });
}

// ─── Template: listing rejected ─────────────────────────────────────────────

export interface ListingRejectedData {
  contactName: string;
  contactEmail: string;
  trackingNumber: string;
  listingTitle: string;
  reason: string;
}

export function buildListingRejectedHtml(data: ListingRejectedData): string {
  const body = `
    <p style="margin:0 0 16px 0;">Hi ${escapeHtml(data.contactName || "there")},</p>
    <p style="margin:0 0 20px 0;">
      Thank you for submitting your listing to <strong>${SITE_NAME}</strong>. After reviewing it,
      we weren&apos;t able to approve it at this time.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:18px;margin:0 0 20px 0;">
      <tr>
        <td>
          <p style="margin:0 0 6px 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#b91c1c;">Reason</p>
          <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;white-space:pre-wrap;">${nl2br(data.reason || "Not provided.")}</p>
        </td>
      </tr>
    </table>

    <h2 style="font-size:15px;color:#0f172a;margin:24px 0 8px 0;font-weight:600;">What you can do</h2>
    <ul style="margin:0 0 8px 0;padding-left:20px;color:#334155;font-size:14px;line-height:1.7;">
      <li>Update your listing to address the issue above.</li>
      <li>Reply to this email with any questions — we&apos;re happy to help.</li>
      <li>Resubmit your listing once you&apos;ve made changes.</li>
    </ul>

    <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">
      Tracking number: <strong>${escapeHtml(data.trackingNumber)}</strong>
    </p>
  `;

  return wrapEmail({
    heading: "Update on your listing",
    intro: "We weren’t able to approve it at this time",
    body,
    accent: "red",
  });
}

export async function sendListingRejectedEmail(data: ListingRejectedData): Promise<SendResult> {
  if (!data.contactEmail) {
    return { ok: false, error: "Submitter email is missing" };
  }
  return sendEmail({
    to: data.contactEmail,
    subject: `Update on your listing submission (${data.trackingNumber})`,
    html: buildListingRejectedHtml(data),
    replyTo: OWNER_EMAIL,
  });
}

// ─── Template: seller inquiry (buyer → site owner) ──────────────────────────

export interface SellerInquiryData {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  listingId: string;
  listingAddress: string;
  listingPrice: number | string;
  listingUrl?: string;
}

export function buildSellerInquiryHtml(data: SellerInquiryData): string {
  const url = data.listingUrl || `${SITE_URL}/homes-for-sale`;
  const price = formatPrice(data.listingPrice);

  const body = `
    <p style="margin:0 0 20px 0;">
      A prospective buyer is interested in one of the listings you manage. Their details are below —
      forward this message to the seller to connect them.
    </p>

    <h2 style="font-size:15px;color:#0f172a;margin:0 0 8px 0;font-weight:600;">Listing</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:10px;padding:16px;margin:0 0 20px 0;">
      <tr><td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:600;">${escapeHtml(data.listingAddress)}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#059669;font-weight:700;">${price}</td></tr>
      <tr><td style="padding:6px 0;font-size:12px;color:#64748b;">Listing ID: ${escapeHtml(data.listingId)}</td></tr>
    </table>

    <h2 style="font-size:15px;color:#0f172a;margin:0 0 8px 0;font-weight:600;">Buyer</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:0 0 20px 0;">
      <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:80px;">Name</td>
          <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${escapeHtml(data.buyerName)}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Email</td>
          <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;"><a href="mailto:${escapeHtml(data.buyerEmail)}" style="color:#059669;">${escapeHtml(data.buyerEmail)}</a></td></tr>
      ${data.buyerPhone ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Phone</td><td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${escapeHtml(data.buyerPhone)}</td></tr>` : ""}
    </table>

    <h2 style="font-size:15px;color:#0f172a;margin:0 0 8px 0;font-weight:600;">Message</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:10px;padding:16px;margin:0 0 8px 0;">
      <tr><td style="font-size:14px;color:#334155;line-height:1.6;">${nl2br(data.message)}</td></tr>
    </table>
  `;

  return wrapEmail({
    heading: "New Seller Inquiry",
    intro: "A buyer is interested in one of your listings",
    body,
    ctaLabel: "View Listing",
    ctaUrl: url,
    accent: "cyan",
  });
}

export async function sendSellerInquiryEmail(data: SellerInquiryData): Promise<SendResult> {
  return sendEmail({
    to: OWNER_EMAIL,
    subject: `New Inquiry: ${data.listingAddress} — ${data.buyerName}`,
    html: buildSellerInquiryHtml(data),
    replyTo: data.buyerEmail,
  });
}

// ─── Template: forward inquiry to actual seller ─────────────────────────────

export interface ForwardInquiryToSellerData {
  sellerName?: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  listingAddress: string;
  listingPrice: number | string;
  listingUrl?: string;
}

export function buildForwardInquiryToSellerHtml(data: ForwardInquiryToSellerData): string {
  const url = data.listingUrl || `${SITE_URL}/homes-for-sale`;

  const body = `
    <p style="margin:0 0 16px 0;">Hi ${escapeHtml(data.sellerName || "there")},</p>
    <p style="margin:0 0 20px 0;">
      Someone is interested in your listing on <strong>${SITE_NAME}</strong> and has sent you a message.
      You can reply directly to this email to get in touch.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:10px;padding:16px;margin:0 0 20px 0;">
      <tr><td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:600;">${escapeHtml(data.listingAddress)}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#059669;font-weight:700;">${formatPrice(data.listingPrice)}</td></tr>
    </table>

    <h2 style="font-size:15px;color:#0f172a;margin:0 0 8px 0;font-weight:600;">From</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:0 0 20px 0;">
      <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:80px;">Name</td>
          <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${escapeHtml(data.buyerName)}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Email</td>
          <td style="padding:6px 0;font-size:14px;color:#059669;font-weight:500;"><a href="mailto:${escapeHtml(data.buyerEmail)}" style="color:#059669;">${escapeHtml(data.buyerEmail)}</a></td></tr>
      ${data.buyerPhone ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Phone</td><td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:500;">${escapeHtml(data.buyerPhone)}</td></tr>` : ""}
    </table>

    <h2 style="font-size:15px;color:#0f172a;margin:0 0 8px 0;font-weight:600;">Message</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:10px;padding:16px;margin:0 0 8px 0;">
      <tr><td style="font-size:14px;color:#334155;line-height:1.6;">${nl2br(data.message)}</td></tr>
    </table>

    <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">
      <strong>Tip:</strong> Just hit reply to contact <strong>${escapeHtml(data.buyerName)}</strong> directly.
    </p>
  `;

  return wrapEmail({
    heading: "A buyer is interested in your home",
    intro: `Inquiry about ${data.listingAddress}`,
    body,
    ctaLabel: "View Listing",
    ctaUrl: url,
    accent: "emerald",
  });
}

export async function sendForwardInquiryToSellerEmail(
  data: ForwardInquiryToSellerData
): Promise<SendResult> {
  if (!data.sellerEmail) {
    return { ok: false, error: "Seller email is missing" };
  }
  return sendEmail({
    to: data.sellerEmail,
    subject: `Inquiry about your ${SITE_NAME} listing — ${data.listingAddress}`,
    html: buildForwardInquiryToSellerHtml(data),
    replyTo: data.buyerEmail,
    bccOwner: true,
  });
}

// ─── Template: feedback (kept for backward compat) ─────────────────────────

export interface FeedbackData {
  rating: number;
  message: string;
  email: string;
}

export function buildFeedbackHtml(data: FeedbackData): string {
  const stars = "★".repeat(Math.max(0, Math.min(5, data.rating))) +
    "☆".repeat(Math.max(0, 5 - Math.min(5, data.rating)));
  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  const label = ratingLabels[Math.max(0, Math.min(5, data.rating))] || "Feedback";

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="text-align:center;margin:8px 0 20px 0;">
      <tr>
        <td style="font-size:36px;color:#f59e0b;letter-spacing:4px;padding-bottom:8px;">${stars}</td>
      </tr>
      <tr>
        <td style="font-size:16px;color:#0f172a;font-weight:600;">${label} (${data.rating}/5)</td>
      </tr>
    </table>

    ${data.message
      ? `<h2 style="font-size:15px;color:#0f172a;margin:0 0 8px 0;font-weight:600;">Feedback</h2>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:10px;padding:16px;margin:0 0 16px 0;">
           <tr><td style="font-size:14px;color:#334155;line-height:1.6;">${nl2br(data.message)}</td></tr>
         </table>`
      : ""
    }

    ${data.email
      ? `<p style="font-size:13px;color:#64748b;margin:0;">Reply to: <a href="mailto:${escapeHtml(data.email)}" style="color:#059669;">${escapeHtml(data.email)}</a></p>`
      : `<p style="font-size:13px;color:#94a3b8;margin:0;">Submitted anonymously</p>`
    }
  `;

  return wrapEmail({
    heading: "New Site Feedback",
    intro: "Someone shared their thoughts about AshevilleRE",
    body,
    accent: "violet",
  });
}

export async function sendFeedbackEmail(data: FeedbackData): Promise<SendResult> {
  return sendEmail({
    to: OWNER_EMAIL,
    subject: `${data.rating}/5 — New AshevilleRE Feedback`,
    html: buildFeedbackHtml(data),
    ...(data.email ? { replyTo: data.email } : {}),
  });
}

// ─── Public: env config snapshot (for admin test page) ─────────────────────

export interface ResendConfig {
  from: string;
  ownerEmail: string;
  configured: boolean;
  siteUrl: string;
}

export function getResendConfig(): ResendConfig {
  return {
    from: FROM_ADDRESS,
    ownerEmail: OWNER_EMAIL,
    configured: isResendConfigured(),
    siteUrl: SITE_URL,
  };
}
