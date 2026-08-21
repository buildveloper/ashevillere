"use client";

import { useState, type FormEvent } from "react";

type Variant = "track" | "contact";

interface LeadFormProps {
  variant: Variant;
  /** Canonical matched address, pre-fill for the track variant. */
  address?: string;
}

type FormState = "idle" | "sending" | "done" | "error";

/**
 * LeadForm — email-only capture, no account, no password.
 * "track" = one email field for the address just looked up;
 * "contact" = email + optional message. Submits to /api/lead; success is
 * only shown after a real 2xx from the relay.
 */
export default function LeadForm({ variant, address }: LeadFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          address:
            variant === "track" && address ? address : undefined,
          message: variant === "contact" ? message.trim() : undefined,
          _honey: honey,
        }),
      });
      if (res.ok) {
        setState("done");
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      setErrorMsg(data?.error ?? "Something went wrong — please try again.");
      setState("error");
    } catch {
      setErrorMsg("Couldn't reach the submission service — please try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6">
        <p className="font-mono text-[11px] tracking-[0.18em] text-safe uppercase">
          {variant === "track" ? "Tracking set" : "Message received"}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          {variant === "track"
            ? "You'll get an email notification if anything changes in this property's public records."
            : "Thanks — we'll reply to the email you gave us. No account needed."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-line bg-surface p-6"
    >
      <p className="font-mono text-[11px] tracking-[0.18em] text-contour uppercase">
        {variant === "track" ? "Track this address" : "Get in touch"}
      </p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-secondary">
        {variant === "track"
          ? "Get an email if anything changes in this property's public records. Email only — no account, no password."
          : "An address to look up, a correction, or a question. Email only — no account, no password."}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`lead-email-${variant}`} className="sr-only">
          Email address
        </label>
        <input
          id={`lead-email-${variant}`}
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-river/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-card transition-colors duration-200 hover:bg-brand-hover disabled:cursor-wait disabled:opacity-60"
        >
          {state === "sending"
            ? "Sending…"
            : variant === "track"
              ? "Track address"
              : "Send"}
        </button>
      </div>

      {variant === "contact" && (
        <label htmlFor={`lead-message-${variant}`} className="sr-only">
          Message
        </label>
      )}
      {variant === "contact" && (
        <textarea
          id={`lead-message-${variant}`}
          rows={3}
          maxLength={1000}
          placeholder="Optional message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-3 w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-river/50 focus:outline-none"
        />
      )}

      {/* Honeypot — invisible to humans, ignored by the API when filled. */}
      <input
        type="text"
        name="_honey"
        value={honey}
        onChange={(e) => setHoney(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <p
        role="status"
        aria-live="polite"
        className="mt-3 font-mono text-[11px] leading-relaxed"
      >
        {state === "error" && <span className="text-clay">ERROR — {errorMsg}</span>}
        {state === "idle" && (
          <span className="text-muted">
            {variant === "track"
              ? "FREE · NO ACCOUNT · UNSUBSCRIBE ANYTIME"
              : "FREE · NO ACCOUNT · NOTHING SOLD"}
          </span>
        )}
      </p>
    </form>
  );
}