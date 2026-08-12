export default function Robot({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`robot-avatar-svg ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Waving robot arm (raised high, waves from the shoulder) */}
      <g className="robot-wave-arm">
        <rect x="68" y="36" width="8" height="30" rx="4" fill="url(#botArmGrad)" />
        <circle cx="72" cy="31" r="7" fill="url(#botHandGrad)" />
      </g>
      {/* Antenna */}
      <line x1="50" y1="18" x2="50" y2="9" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="8" r="4" fill="url(#botAntGrad)" className="robot-antenna-glow" />
      {/* Ears */}
      <circle cx="24" cy="40" r="5" fill="#1E40AF" />
      <circle cx="76" cy="40" r="5" fill="#1E40AF" />
      {/* Head */}
      <rect x="26" y="20" width="48" height="42" rx="12" fill="url(#botHeadGrad)" />
      {/* Eyes */}
      <circle cx="40" cy="34" r="5" fill="#E0F2FE" className="robot-eye" />
      <circle cx="60" cy="34" r="5" fill="#E0F2FE" className="robot-eye" />
      <circle cx="38" cy="32" r="1.8" fill="#93C5FD" />
      <circle cx="58" cy="32" r="1.8" fill="#93C5FD" />
      {/* Smile */}
      <path d="M42 47 Q50 54 58 47" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="30" y="64" width="40" height="24" rx="10" fill="url(#botBodyGrad)" />
      {/* Chest light */}
      <circle cx="50" cy="72" r="4" fill="#22D3EE" />
      {/* Static left arm */}
      <rect x="21" y="64" width="8" height="16" rx="4" fill="url(#botArmGrad)" />
      <defs>
        <linearGradient id="botHeadGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="botBodyGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#172554" />
        </linearGradient>
        <linearGradient id="botArmGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
        <radialGradient id="botHandGrad" cx="50%" cy="50%" r="50%">
          <stop stopColor="#93C5FD" />
          <stop offset="1" stopColor="#3B82F6" />
        </radialGradient>
        <radialGradient id="botAntGrad" cx="50%" cy="50%" r="50%">
          <stop stopColor="#BFDBFE" />
          <stop offset="1" stopColor="#2563EB" />
        </radialGradient>
      </defs>
    </svg>
  );
}
