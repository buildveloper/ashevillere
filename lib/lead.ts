/**
 * Email-only lead capture — no account, no password.
 *
 * Leads POST to /api/lead, are validated here, and are forwarded to the
 * FormSubmit relay (free, no API key) which delivers them to the
 * FORMSUBMIT_EMAIL inbox. If the relay is unreachable or not configured,
 * the caller gets an honest failure — a submission is never reported as
 * sent when it wasn't.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;
const MAX_ADDRESS_LEN = 200;
const MAX_MESSAGE_LEN = 1000;

export interface LeadPayload {
  email: string;
  /** Canonical matched address for the "track this address" variant. */
  address?: string;
  /** Optional message (contact variant). */
  message?: string;
}

export type LeadValidation =
  | { ok: true; payload: LeadPayload }
  | { ok: false; error: string };

/** Validate and normalize a lead submission (pure, unit-testable). */
export function validateLead(input: unknown): LeadValidation {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Invalid submission." };
  }
  const { email, address, message, _honey } = input as Record<string, unknown>;

  // Honeypot: a real visitor never fills this hidden field.
  if (typeof _honey === "string" && _honey.length > 0) {
    return { ok: false, error: "Invalid submission." };
  }

  if (typeof email !== "string") {
    return { ok: false, error: "Enter a valid email address." };
  }
  const cleanEmail = email.trim();
  if (
    cleanEmail.length > MAX_EMAIL_LEN ||
    !EMAIL_RE.test(cleanEmail)
  ) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const cleanAddress =
    typeof address === "string" ? address.trim().slice(0, MAX_ADDRESS_LEN) : "";
  const cleanMessage =
    typeof message === "string" ? message.trim().slice(0, MAX_MESSAGE_LEN) : "";

  return {
    ok: true,
    payload: {
      email: cleanEmail,
      address: cleanAddress || undefined,
      message: cleanMessage || undefined,
    },
  };
}

/**
 * Deliver a lead by email via the Resend API (authenticated, server-safe —
 * FormSubmit rejects datacenter IPs with 403, so the browser-relay approach
 * cannot work from Vercel). Returns ok:true only on a 2xx response with a
 * sent id; otherwise ok:false with the failure detail surfaced for logs.
 *
 * Env: AUTH_RESEND_KEY (Resend API key), FORMSUBMIT_EMAIL (the lead inbox —
 * name kept from the earlier relay), EMAIL_FROM (optional; falls back to
 * Resend's sandbox sender until the sending domain is verified).
 */
export async function submitLead(
  payload: LeadPayload
): Promise<{ ok: boolean; detail?: string }> {
  const apiKey = process.env.AUTH_RESEND_KEY?.trim();
  const to = process.env.FORMSUBMIT_EMAIL?.trim();
  if (!apiKey || !to) {
    return { ok: false, detail: "AUTH_RESEND_KEY or FORMSUBMIT_EMAIL not configured" };
  }

  const subject = payload.address
    ? `Track this address — ${payload.address}`
    : "New AshevilleRE lead";

  const lines = [
    `Email: ${payload.email}`,
    payload.address ? `Address: ${payload.address}` : null,
    payload.message ? `Message: ${payload.message}` : null,
    `Source: ${payload.address ? "track-this-address form" : "contact form"}`,
  ].filter(Boolean);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM?.trim() || "AshevilleRE <onboarding@resend.dev>",
        to,
        subject,
        text: lines.join("\n"),
        reply_to: payload.email,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, detail: `Resend HTTP ${res.status}: ${body.slice(0, 180)}` };
    }
    const data = (await res.json().catch(() => null)) as { id?: string } | null;
    if (!data?.id) return { ok: false, detail: "Resend returned no message id" };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      detail:
        err instanceof Error && err.name === "TimeoutError"
          ? "Resend timed out after 8s"
          : "Resend unreachable",
    };
  }
}