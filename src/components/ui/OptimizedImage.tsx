"use client";

import { useState } from "react";
import Image from "next/image";

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  overlay?: boolean;
  rounded?: boolean;
  objectFit?: "cover" | "contain";
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className = "",
  overlay = false,
  rounded = false,
  objectFit = "cover",
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const isDataUri = src.startsWith("data:");

  if (errored) {
    return <FallbackImage className={className} overlay={overlay} />;
  }

  // For data URIs, fall back to regular img since next/image can't optimize them
  if (isDataUri) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-${objectFit} transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
        {!loaded && <ShimmerPlaceholder />}
        {overlay && <ImageOverlay />}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${rounded ? "rounded-2xl" : ""} ${className}`}>
      {!loaded && <ShimmerPlaceholder />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={`object-${objectFit} transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        quality={85}
        unoptimized={false}
      />
      {overlay && <ImageOverlay />}
    </div>
  );
}

function FallbackImage({ className, overlay }: { className: string; overlay: boolean }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <svg className="w-12 h-12 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
      {overlay && <ImageOverlay />}
    </div>
  );
}

function ShimmerPlaceholder() {
  return (
    <div className="absolute inset-0 shimmer-bg z-10" />
  );
}

function ImageOverlay() {
  return (
    <div className="absolute inset-0 z-20 bg-gradient-to-t from-deep-slate-950/70 via-deep-slate-950/20 to-transparent pointer-events-none" />
  );
}
