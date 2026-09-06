"use client";

/**
 * Aceternity-style spotlight — a large, soft elliptical light cone rendered
 * behind hero/section content. Pure SVG + gaussian blur, zero runtime cost.
 */
export function Spotlight({
  className = "",
  fill = "#e5484a",
  id = "spotlight",
}) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute select-none ${className}`}
      width="1280"
      height="880"
      viewBox="0 0 1280 880"
      fill="none"
    >
      <g filter={`url(#${id}-filter)`}>
        <ellipse
          cx="640"
          cy="140"
          rx="540"
          ry="250"
          fill={fill}
          fillOpacity="0.22"
        />
        <ellipse
          cx="640"
          cy="120"
          rx="340"
          ry="150"
          fill={fill}
          fillOpacity="0.14"
        />
      </g>
      <defs>
        <filter id={`${id}-filter`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="120" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Subtle dot/grid backdrop — Magic UI "Grid" concept.
 * Fade it out toward the edges with a radial mask.
 */
export function DotGrid({ className = "", size = 36, color = "rgba(255,255,255,0.055)" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        maskImage:
          "radial-gradient(ellipse 90% 70% at 50% 0%, #000 40%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 70% at 50% 0%, #000 40%, transparent 100%)",
      }}
    />
  );
}