"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { Search, Sparkles, MapPin, ArrowRight, ChevronDown, Gem, Home } from "lucide-react";
import Link from "next/link";

// Floating mountain silhouette
function FloatingElement({
  children,
  xRange = 20,
  yRange = 15,
  duration = 6,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  xRange?: number;
  yRange?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        x: [0, xRange, 0, -xRange, 0],
        y: [0, -yRange, 0, yRange, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "mirror",
      }}
    >
      {children}
    </motion.div>
  );
}

// Magnetic CTA button
function MagneticButton({
  children,
  href,
  variant = "primary",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 25 });
  const springY = useSpring(y, { stiffness: 300, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isPrimary = variant === "primary";

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="inline-block"
    >
      <Link
        href={href}
        className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm transition-all duration-500 ${
          isPrimary
            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            : "border border-emerald-500/30 text-emerald-400 hover:text-white hover:bg-emerald-500/10"
        }`}
      >
        {children}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        {/* Shimmer effect on primary */}
        {isPrimary && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.12) 55%, transparent 60%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s infinite linear",
              }}
            />
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);

  // Autoplay video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
    const handleCanPlay = () => setVideoReady(true);
    video.addEventListener("canplaythrough", handleCanPlay);
    // Handle autoplay failure gracefully
    const playOnInteraction = () => {
      video.play().catch(() => {});
      document.removeEventListener("click", playOnInteraction);
    };
    document.addEventListener("click", playOnInteraction, { once: true });
    return () => {
      video.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 scale-110"
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover opacity-100"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero-poster.jpg"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Gradient overlays for text readability */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: videoReady ? 1 : 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-deep-slate-950/80 via-deep-slate-950/30 to-deep-slate-950/50" />
          <div className="absolute inset-0 bg-deep-slate-950/20" />
        </div>

        {/* Fallback gradient behind video while loading */}
        <motion.div
          className="absolute inset-0 bg-gradient-hero"
          animate={{ opacity: videoReady ? 0 : 1 }}
          transition={{ duration: 0.6 }}
        />
      </div>

      {/* Floating decorative elements */}
      <FloatingElement xRange={25} yRange={20} duration={7} delay={0} className="top-[15%] sm:left-[10%] hidden sm:block">
        <div className="w-20 h-20 rounded-full border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-sm" />
      </FloatingElement>
      <FloatingElement xRange={20} yRange={25} duration={8} delay={1.5} className="top-[25%] right-[8%] hidden sm:block">
        <div className="w-16 h-16 rounded-full border border-cyan-400/10 bg-cyan-400/5 backdrop-blur-sm" />
      </FloatingElement>
      <FloatingElement xRange={30} yRange={15} duration={9} delay={3} className="bottom-[30%] left-[20%] hidden md:block">
        <div className="w-12 h-12 rounded-full border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-sm" />
      </FloatingElement>
      <FloatingElement xRange={15} yRange={22} duration={6.5} delay={2} className="top-[35%] right-[25%] hidden lg:block">
        <Gem className="w-8 h-8 text-emerald-500/15" strokeWidth={1} />
      </FloatingElement>
      <FloatingElement xRange={18} yRange={18} duration={7.5} delay={4} className="bottom-[35%] right-[15%] hidden md:block">
        <Home className="w-7 h-7 text-cyan-400/15" strokeWidth={1} />
      </FloatingElement>

      {/* Main content */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 0.5], [0, -50]), scale: heroScale }}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-20 pb-32"
      >
        {/* Subtitle badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400 tracking-wide">
            FREE MARKET INSIGHTS & TOOLS
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6"
        >
          <span className="text-white">Discover </span>
          <span className="text-gradient">Asheville</span>
          <br />
          <span className="text-gradient">Real Estate</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          Free market insights, tools, neighborhood guides &amp; AI assistant — all
          crafted for Asheville&apos;s unique real estate landscape.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl mx-auto mb-10"
        >
          <motion.div
            className={`relative flex items-center rounded-2xl transition-all duration-500 ${
              searchFocused
                ? "glass-strong shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                : "glass shadow-md"
            }`}
            animate={searchFocused ? { scale: 1.02 } : { scale: 1 }}
          >
            <Search
              className={`absolute left-5 w-5 h-5 transition-colors duration-300 ${
                searchFocused ? "text-emerald-400" : "text-slate-400"
              }`}
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search neighborhoods, reports, tools..."
              className="flex-1 bg-transparent border-none py-4 pl-12 pr-24 text-sm sm:text-base text-white placeholder:text-slate-400 focus:outline-none"
            />
            <motion.button
              className="absolute right-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold rounded-xl"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Search
            </motion.button>
          </motion.div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton href="/ai-assistant" variant="primary">
            <Sparkles className="w-4 h-4" />
            Talk to AI Assistant
          </MagneticButton>
          <MagneticButton href="/neighborhoods" variant="secondary">
            <MapPin className="w-4 h-4" />
            Explore Neighborhoods
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-xs text-slate-500 font-medium tracking-widest uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-emerald-500/60" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </section>
  );
}
