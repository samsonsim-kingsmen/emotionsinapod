import React from "react";

/**
 * Props:
 * - size: number (px)                    default 96
 * - isRecording: boolean                 white -> red when true
 * - progress: number (0..1)              progress along the ring
 * - onClick: () => void                  click handler
 * - ringColor: string                    default "#D9D9D9" (light grey)
 * - progressColor: string                default "#FFFFFF" (white)
 * - gapPx: number                        default 3 (gap between ring and inner circle)
 * - strokeWidth: number                  default 6 (ring thickness)
 */
export default function RecordButton({
  size = 96,
  isRecording = false,
  progress = 0,
  onClick,
  ringColor = "#D9D9D9",
  progressColor = "#FFFFFF",
  gapPx = 3,
  strokeWidth = 6,
}) {
  const half = size / 2;

  // Ring radius (keeping ring fully inside viewBox)
  const r = half - strokeWidth / 2; // outer ring radius (for stroke)
  const circumference = 2 * Math.PI * r;

  // Progress (clamped 0..1)
  const p = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - p);

  // Inner circle radius leaves a small visual gap from ring
  const innerRadius = r - strokeWidth / 2 - gapPx;

  return (
    <button
      onClick={onClick}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      style={{
        all: "unset",
        cursor: "pointer",
        width: size,
        height: size,
        display: "inline-block",
        lineHeight: 0,
        userSelect: "none",
        zIndex:"999"
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        style={{
          transform: "rotate(-90deg)", // start progress at 12 o'clock
          display: "block",
        }}
      >
        {/* Background ring (light grey) */}
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress ring (white stroke) */}
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />

        {/* Inner fill (white -> red) */}
        <g style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%" }}>
          <circle
            cx={half}
            cy={half}
            r={innerRadius}
            fill={isRecording ? "#E02020" : "#FFFFFF"}
            style={{ transition: "fill 150ms ease" }}
          />
        </g>
      </svg>
    </button>
  );
}
