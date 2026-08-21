"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

type FormState = "idle" | "sending" | "sent" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login — magic-link only, no passwords.
 * Submits to Auth.js's resend provider; the "sent" state only shows after a
 * successful link dispatch, never for a failed one.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    const clean = email.trim();
    if (!EMAIL_RE.test(clean)) {
      setErrorMsg("Enter a valid email address.");
      setState("error");
      return;
    }
    setState("sending");
    try {
      const res = await signIn("resend", { email: clean, redirect: false });
      if (res?.error) throw new Error(res.error);
      setState("sent");
    } catch {
      setErrorMsg(
        "Couldn't send a sign-in link right now — try again in a moment."
      );
      setState("error");
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col justify-center px-6 pb-24 pt-32">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        AshevilleRE Pro
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
        {state === "sent" ? "Check your inbox." : "Sign in with email."}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-secondary">
        {state === "sent"
          ? "If the address is valid, a sign-in link is on its way. No password, no account to remember."
          : "We’ll email you a sign-in link. Magic links only — no passwords, no accounts to remember."}
      </p>

      {state !== "sent" && (
        <form onSubmit={submit} className="mt-10">
          <label htmlFor="login-email" className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              maxLength={254}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-muted focus:border-river/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="shrink-0 rounded-xl bg-brand px-6 py-3 text-sm font-medium text-card transition-colors duration-200 hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : "Email me a link"}
            </button>
          </div>
          <p
            role="status"
            aria-live="polite"
            className="mt-3 font-mono text-[11px] leading-relaxed"
          >
            {state === "error" && (
              <span className="text-clay">ERROR — {errorMsg}</span>
            )}
            {state === "idle" && (
              <span className="text-muted">NO PASSWORD · NO SIGN-UP FORM</span>
            )}
          </p>
        </form>
      )}

      <p className="mt-10 text-sm text-secondary">
        Pro gates the data dashboard for professionals. The free address
        lookup doesn’t need an account.{" "}
        <Link href="/" className="text-river transition-colors hover:text-ink">
          Back to the lookup →
        </Link>
      </p>
    </main>
  );
}