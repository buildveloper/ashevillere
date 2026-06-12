"use client";

import { type ComponentType } from "react";

export interface LogoProps {
  className?: string;
  size?: number;
}

function LogoContainer({
  children,
  className,
  size = 48,
  gradient = "from-emerald-500/10 to-cyan-400/10",
}: {
  children: React.ReactNode;
  className?: string;
  size?: number;
  gradient?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}

export function TurboTenantLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 28 28" fill="none">
        <rect x="2" y="12" width="11" height="14" rx="1" fill="#10B981" opacity="0.9" />
        <rect x="15" y="2" width="11" height="24" rx="1" fill="#10B981" opacity="0.7" />
        <path d="M7.5 3.5L13 11l-11 0 5.5-7.5z" fill="#34D399" opacity="0.5" />
      </svg>
    </LogoContainer>
  );
}

export function BuildiumLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className} gradient="from-cyan-400/10 to-blue-400/10">
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 26 26" fill="none">
        <rect x="4" y="4" width="8" height="8" rx="1.5" fill="#22D3EE" opacity="0.85" />
        <rect x="14" y="4" width="8" height="8" rx="1.5" fill="#22D3EE" opacity="0.6" />
        <rect x="4" y="14" width="8" height="8" rx="1.5" fill="#22D3EE" opacity="0.6" />
        <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#22D3EE" opacity="0.4" />
      </svg>
    </LogoContainer>
  );
}

export function AvailLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className}>
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <path d="M13.5 2L22 7v10L13.5 22 5 17V7L13.5 2z" stroke="#34D399" strokeWidth="1.8" fill="none" />
        <circle cx="13.5" cy="12" r="4" fill="#10B981" opacity="0.7" />
        <path d="M13.5 13v4M11 12l2.5-2 2.5 2" stroke="#fff" strokeWidth="0.8" fill="none" />
      </svg>
    </LogoContainer>
  );
}

export function PriceLabsLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className} gradient="from-cyan-400/10 to-emerald-500/10">
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <rect x="3" y="2" width="21" height="23" rx="3" fill="#22D3EE" opacity="0.15" />
        <path d="M6 20l5-10 4 8 6-12" stroke="#22D3EE" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="11" cy="10" r="1.8" fill="#22D3EE" />
        <circle cx="15" cy="18" r="1.8" fill="#22D3EE" />
        <circle cx="21" cy="8" r="1.8" fill="#22D3EE" />
      </svg>
    </LogoContainer>
  );
}

export function BiggerPocketsLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className}>
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <rect x="3" y="6" width="10" height="15" rx="1.5" fill="#10B981" opacity="0.85" />
        <rect x="14" y="3" width="10" height="18" rx="1.5" fill="#10B981" opacity="0.55" />
        <path d="M8 11h4M8 14.5h4M8 18h3" stroke="#fff" strokeWidth="0.8" fill="none" />
        <path d="M19 8h-.5M19 11h-.5M19 14h-.5M19 17h-.5" stroke="#fff" strokeWidth="0.6" fill="none" />
      </svg>
    </LogoContainer>
  );
}

export function SteadilyLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className}>
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <path d="M13.5 2L4 7v6.5c0 5 4 9.5 9.5 11.5 5.5-2 9.5-6.5 9.5-11.5V7L13.5 2z" stroke="#34D399" strokeWidth="1.8" fill="none" />
        <path d="M9.5 13l2.5 3 5.5-6" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </LogoContainer>
  );
}

export function LegalZoomLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className} gradient="from-cyan-400/10 to-blue-400/10">
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <circle cx="13.5" cy="13.5" r="11" stroke="#22D3EE" strokeWidth="1.8" fill="none" />
        <path d="M13.5 6v15M6 13.5h15" stroke="#22D3EE" strokeWidth="1.5" fill="none" />
        <path d="M10 10l7 7M10 17l7-7" stroke="#22D3EE" strokeWidth="0.8" fill="none" opacity="0.4" />
      </svg>
    </LogoContainer>
  );
}

export function RoofstockLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className}>
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <path d="M3 13l10.5-9L24 13" stroke="#34D399" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 12v10c0 1 .8 1.5 1.5 1.5h4.5v-6h3v6h4.5c.7 0 1.5-.5 1.5-1.5V12" stroke="#34D399" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="13" y="16" width="1" height="2" fill="#10B981" opacity="0.6" />
      </svg>
    </LogoContainer>
  );
}

export function StessaLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className} gradient="from-cyan-400/10 to-emerald-500/10">
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <rect x="3" y="21" width="6" height="4" rx="1" fill="#22D3EE" opacity="0.85" />
        <rect x="10.5" y="16" width="6" height="9" rx="1" fill="#22D3EE" opacity="0.7" />
        <rect x="18" y="9" width="6" height="16" rx="1" fill="#22D3EE" opacity="0.4" />
      </svg>
    </LogoContainer>
  );
}

export function HireAHelperLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className} gradient="from-amber-500/10 to-amber-400/10">
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <rect x="5" y="14" width="17" height="9" rx="1.5" fill="#F59E0B" opacity="0.7" />
        <path d="M8.5 14V9.5C8.5 6.46 10.96 4 13.5 4s5 2.46 5 5.5V14" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="12" y="18" width="3" height="3" rx="0.5" fill="#fff" opacity="0.5" />
      </svg>
    </LogoContainer>
  );
}

export function PODSLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className} gradient="from-amber-500/10 to-amber-400/10">
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <rect x="4" y="6" width="19" height="15" rx="2" stroke="#F59E0B" strokeWidth="1.8" fill="none" />
        <line x1="13.5" y1="6" x2="13.5" y2="21" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
        <line x1="4" y1="13.5" x2="23" y2="13.5" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
        <path d="M9 10.5l2-2 2 2M14 16.5l2 2 2-2" stroke="#F59E0B" strokeWidth="0.8" fill="none" />
      </svg>
    </LogoContainer>
  );
}

export function AngiLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className} gradient="from-cyan-400/10 to-emerald-500/10">
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <path d="M13.5 3L3 10v7l10.5 7L24 17v-7L13.5 3z" stroke="#22D3EE" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
        <path d="M13.5 8v11M8 11l5.5 5.5L19 11" stroke="#22D3EE" strokeWidth="1.2" fill="none" opacity="0.5" />
      </svg>
    </LogoContainer>
  );
}

export function HomeAdvisorLogo({ className, size = 48 }: LogoProps) {
  return (
    <LogoContainer size={size} className={className} gradient="from-cyan-400/10 to-blue-400/10">
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 27 27" fill="none">
        <path d="M13.5 3L4 10.5V22c0 1 .7 2 2 2h15c1.3 0 2-1 2-2V10.5L13.5 3z" stroke="#22D3EE" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
        <path d="M9.5 24v-7h8v7" stroke="#22D3EE" strokeWidth="1.5" fill="none" />
        <circle cx="13.5" cy="12" r="1.5" fill="#22D3EE" opacity="0.5" />
      </svg>
    </LogoContainer>
  );
}

const LOGO_MAP: Record<string, ComponentType<LogoProps>> = {
  "TurboTenant": TurboTenantLogo,
  "Buildium": BuildiumLogo,
  "Avail": AvailLogo,
  "PriceLabs": PriceLabsLogo,
  "BiggerPockets": BiggerPocketsLogo,
  "Steadily": SteadilyLogo,
  "LegalZoom": LegalZoomLogo,
  "Roofstock": RoofstockLogo,
  "Stessa": StessaLogo,
  "HireAHelper": HireAHelperLogo,
  "PODS": PODSLogo,
  "Angi": AngiLogo,
  "HomeAdvisor": HomeAdvisorLogo,
};

export function AffiliateLogo({
  name,
  size = 48,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Logo = LOGO_MAP[name];
  if (!Logo) {
    return (
      <LogoContainer size={size} className={className}>
        <span className="font-display text-lg font-bold text-emerald-400">
          {name.charAt(0)}
        </span>
      </LogoContainer>
    );
  }
  return <Logo size={size} className={className} />;
}
