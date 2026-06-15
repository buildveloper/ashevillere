"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function NickLaunchesBadge() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const badgeSrc = isDark
    ? "https://nicklaunches.com/badges/featured-dark.svg"
    : "https://nicklaunches.com/badges/featured.svg";

  return (
    <a
      href="https://nicklaunches.com/products/ashevillere/?utm_source=ashevillere.com&utm_medium=badge&utm_campaign=featured"
      target="_blank"
      rel="noopener"
      className="inline-flex opacity-60 hover:opacity-100 transition-opacity duration-300"
      style={{ visibility: mounted ? "visible" : "hidden" }}
    >
      <img
        src={badgeSrc}
        alt="AshevilleRE on Nick Launches"
        width={244}
        height={56}
      />
    </a>
  );
}
