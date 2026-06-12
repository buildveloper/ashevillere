// Input sanitization and validation utilities
// Strips XSS vectors, validates types, and enforces length limits

const MAX_STRING_LENGTH = 5000;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONTENT_LENGTH = 50000;
const MAX_ARRAY_LENGTH = 50;

// HTML/XSS sanitization — strips script tags, event handlers, javascript: URIs
export function sanitizeString(input: unknown, maxLength = MAX_STRING_LENGTH): string {
  if (typeof input !== "string") return "";
  let cleaned = input.slice(0, maxLength);
  // Strip script tags and their content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Strip event handlers (onclick, onerror, etc.)
  cleaned = cleaned.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "");
  cleaned = cleaned.replace(/\bon\w+\s*=\s*\S+/gi, "");
  // Strip javascript: URIs
  cleaned = cleaned.replace(/javascript\s*:/gi, "");
  // Strip data: URIs (potential SVG/HTML injection)
  cleaned = cleaned.replace(/data\s*:\s*text\/html/gi, "");
  // Strip HTML tags (allow basic formatting if needed, but default to strip)
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  return cleaned.trim();
}

export function sanitizeHtml(input: unknown, maxLength = MAX_CONTENT_LENGTH): string {
  if (typeof input !== "string") return "";
  let cleaned = input.slice(0, maxLength);
  // Strip dangerous tags and their content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  cleaned = cleaned.replace(/<embed\b[^>]*>/gi, "");
  // Strip event handlers
  cleaned = cleaned.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "");
  cleaned = cleaned.replace(/\bon\w+\s*=\s*\S+/gi, "");
  // Strip javascript: and data: URIs
  cleaned = cleaned.replace(/javascript\s*:/gi, "");
  cleaned = cleaned.replace(/data\s*:\s*text\/html/gi, "");
  return cleaned.trim();
}

export function sanitizeUserMessage(input: unknown): string {
  if (typeof input !== "string") return "";
  let cleaned = input.slice(0, MAX_MESSAGE_LENGTH);
  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, "");
  // Collapse excessive whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

export function sanitizeEmail(input: unknown): string {
  const cleaned = sanitizeString(input, 320);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return "";
  return cleaned.toLowerCase();
}

export function sanitizeUrl(input: unknown): string {
  if (typeof input !== "string") return "";
  const cleaned = input.slice(0, 2048).trim();
  try {
    const url = new URL(cleaned);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function sanitizeSlug(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .slice(0, 200)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Validate and sanitize an array of strings
export function sanitizeStringArray(
  input: unknown,
  maxLength = MAX_STRING_LENGTH
): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, MAX_ARRAY_LENGTH)
    .map((item) => sanitizeString(item, maxLength))
    .filter((s) => s.length > 0);
}

// Validate a numeric ID
export function sanitizeId(input: unknown): string {
  return sanitizeString(input, 100).replace(/[^a-zA-Z0-9_-]/g, "");
}

// Validate a tracking number
export function sanitizeTrackingNumber(input: unknown): string {
  if (typeof input !== "string") return "";
  const cleaned = input.slice(0, 20).trim().toUpperCase();
  if (!/^[A-Z]{3}-[A-Z0-9]{5}$/.test(cleaned)) return "";
  return cleaned;
}

// Validate a number within range
export function sanitizeNumber(input: unknown, min = 0, max = 999999999): number {
  const num = Number(input);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.round(num)));
}

// Validate a positive integer
export function sanitizePositiveInt(input: unknown, max = 9999): number {
  const num = Number(input);
  if (!Number.isFinite(num) || num < 0 || !Number.isInteger(num)) return 0;
  return Math.min(max, num);
}

// Deep sanitize an object (recursive string sanitization)
export function sanitizeObject(obj: unknown, maxDepth = 10): unknown {
  if (maxDepth <= 0) return null;
  if (obj === null || obj === undefined) return null;
  if (typeof obj === "string") return sanitizeString(obj);
  if (typeof obj === "number") {
    return Number.isFinite(obj) ? obj : 0;
  }
  if (typeof obj === "boolean") return obj;
  if (Array.isArray(obj)) {
    return obj.slice(0, MAX_ARRAY_LENGTH).map((item) => sanitizeObject(item, maxDepth - 1));
  }
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>).slice(0, 50);
    for (const key of keys) {
      const safeKey = sanitizeString(key, 100);
      if (safeKey) {
        result[safeKey] = sanitizeObject(
          (obj as Record<string, unknown>)[key],
          maxDepth - 1
        );
      }
    }
    return result;
  }
  return null;
}

// Rate-limit identifiers: IP-based with optional user token
export function getRateLimitIdentifier(
  ip: string | null,
  userToken?: string | null
): string {
  if (userToken) return `user:${sanitizeString(userToken, 100)}`;
  return `ip:${ip || "unknown"}`;
}

// Validate environment variables at startup
export function validateEnv(): string[] {
  const errors: string[] = [];

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
    errors.push("GROQ_API_KEY is not configured");
  }

  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw || adminPw === "change_this_in_production" || adminPw.length < 8) {
    errors.push(
      "ADMIN_PASSWORD must be at least 8 characters and not the default value"
    );
  }

  const allowedModels = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
  const model = process.env.GROQ_MODEL;
  if (model && !allowedModels.includes(model)) {
    errors.push(`GROQ_MODEL "${model}" is not in the allowed models list`);
  }

  return errors;
}
