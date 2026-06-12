"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

function subscribeToMediaQuery(query: string, callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(query);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot(query: string) {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => subscribeToMediaQuery(query, callback),
    [query]
  );
  const getSnap = useCallback(() => getSnapshot(query), [query]);
  return useSyncExternalStore(subscribe, getSnap);
}

export function useBreakpoint() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return { isMobile, isTablet, isDesktop };
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
    );
  }, []);

  return isTouch;
}
