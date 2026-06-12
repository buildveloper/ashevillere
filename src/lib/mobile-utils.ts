export const MOBILE_TOUCH_TARGET = 44;

export function disableBodyScroll(lock: boolean) {
  if (typeof document === "undefined") return;
  document.body.style.overflow = lock ? "hidden" : "";
  if (lock) {
    document.body.style.touchAction = "none";
  } else {
    document.body.style.touchAction = "";
  }
}

export function getSafeAreaBottom(): string {
  if (typeof window === "undefined") return "0px";
  return getComputedStyle(document.documentElement).getPropertyValue("--safe-area-bottom") || "0px";
}
