// Admin authentication — secure password hashing with scrypt
// Uses crypto.timingSafeEqual for constant-time comparison to prevent timing attacks

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "avl_admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours (reduced from 7 days)
const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 };

const isDev = process.env.NODE_ENV === "development";

function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw === "change_this_in_production") {
    throw new Error("ADMIN_PASSWORD environment variable is not set or using default value");
  }
  if (pw.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }
  return pw;
}

// Hash password with scrypt
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt}:${derivedKey.toString("hex")}`;
}

// Verify password against hash (constant-time)
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (err, dk) => {
      if (err) reject(err);
      else resolve(dk);
    });
  });

  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== derivedKey.length) return false;

  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

// Generate a secure session token
function generateSessionToken(): string {
  return crypto.randomBytes(48).toString("base64url");
}

// Generate a HMAC signature from token + secret
function signToken(token: string): string {
  const secret = getAdminPassword();
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

// Verify token signature
function verifyTokenSignature(token: string, signature: string): boolean {
  const expected = signToken(token);
  const expectedBuf = Buffer.from(expected, "hex");
  const sigBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, sigBuf);
}

// Create a signed session token for the cookie
export function createSessionToken(): string {
  const token = generateSessionToken();
  const signature = signToken(token);
  return `${token}.${signature}`;
}

// Validate a session cookie
export function validateSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;
  const [token, signature] = parts;
  if (!token || !signature) return false;
  return verifyTokenSignature(token, signature);
}

// Set auth cookie on response
export function setAuthCookie(response: NextResponse): void {
  const token = createSessionToken();
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: !isDev,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

// Clear auth cookie on response
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: !isDev,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Check if request is authenticated
export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return validateSession(token);
}

// Verify admin password and return result
export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const storedHash = process.env.ADMIN_PASSWORD_HASH;
    if (storedHash) {
      return verifyPassword(password, storedHash);
    }
    // Fallback: direct comparison (for initial setup)
    const adminPw = getAdminPassword();
    return password === adminPw;
  } catch {
    return false;
  }
}

// Rate limiting for login attempts (5 per 15 minutes per IP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count++;
  return true;
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    entry.count++;
  }
}
