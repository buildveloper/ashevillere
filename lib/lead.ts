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
 * Forward a lead to the FormSubmit AJAX endpoint. Returns true only on a
 * 2xx response from the relay. A missing FORMSUBMIT_EMAIL or a failed
 * request returns false — never a fake success.
 */
export async function submitLead(payload: LeadPayload): Promise<boolean> {
  const inbox = process.env.FORMSUBMIT_EMAIL?.trim();
  if (!inbox) return false;

  const subject = payload.address
    ? `Track this address — ${payload.address}`
    : "New AshevilleRE lead";

  const body: Record<string, string> = {
    email: payload.email,
    _subject: subject,
    _template: "table",
    _captcha: "false",
  };
  if (payload.address) body["Address"] = payload.address;
  if (payload.message) body["Message"] = payload.message;

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}