"use client";

const STORAGE_KEY = "avl_pdf_rate_limit";
const MAX_GENERATIONS = 2;
const WINDOW_HOURS = 3;
const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

interface RateLimitState {
  count: number;
  windowStart: number;
}

function getState(): RateLimitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RateLimitState;
      if (Date.now() - parsed.windowStart > WINDOW_MS) {
        return { count: 0, windowStart: Date.now() };
      }
      return parsed;
    }
  } catch {}
  return { count: 0, windowStart: Date.now() };
}

function setState(state: RateLimitState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function canGeneratePDF(): boolean {
  const state = getState();
  return state.count < MAX_GENERATIONS;
}

export function recordPDFGeneration(): void {
  const state = getState();
  setState({ count: state.count + 1, windowStart: state.windowStart });
}

export function remainingGenerations(): number {
  const state = getState();
  return Math.max(0, MAX_GENERATIONS - state.count);
}

export function timeUntilReset(): number {
  const state = getState();
  const elapsed = Date.now() - state.windowStart;
  return Math.max(0, WINDOW_MS - elapsed);
}

export { MAX_GENERATIONS, WINDOW_HOURS };
