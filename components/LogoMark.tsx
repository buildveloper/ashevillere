/**
 * AshevilleRE mark — 3-arc variant (the faint outer stone arc is dropped
 * because it collapses into a smudge at favicon / header sizes; the full
 * 4-arc mark still ships in the og image and at 180/192/512px where there
 * are enough pixels to read every layer). Sized by the parent via
 * className; decorative next to the wordmark, so it is hidden from
 * assistive tech (the Link carries the label).
 */
export default function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="100" height="100" rx="20" fill="#EDEFE7" />
      <path
        d="M14,68 Q50,32 86,68"
        fill="none"
        stroke="#1E3B2C"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M23,58 Q50,26 77,58"
        fill="none"
        stroke="#2C5240"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M33,48 Q50,22 67,48"
        fill="none"
        stroke="#B8763A"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
