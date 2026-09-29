import React from 'react';

interface GitArmorLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  tagline?: boolean;
  className?: string;
  lang?: 'ar' | 'en';
}

const sizeMap = {
  xs: { box: 20, emblem: 'w-5 h-5', text: 'text-[13px]', badge: 'text-[9px] px-1 py-0.2' },
  sm: { box: 26, emblem: 'w-6.5 h-6.5', text: 'text-sm', badge: 'text-[9px] px-1.5 py-0.2' },
  md: { box: 34, emblem: 'w-8.5 h-8.5', text: 'text-base', badge: 'text-[10px] px-1.5 py-0.5' },
  lg: { box: 48, emblem: 'w-12 h-12', text: 'text-xl', badge: 'text-xs px-2 py-0.5' },
  xl: { box: 64, emblem: 'w-16 h-16', text: 'text-2xl', badge: 'text-xs px-2.5 py-0.5' },
};

export function GitArmorEmblem({ size = 26, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform group-hover:scale-105 duration-200 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldBg" x1="5" y1="2.5" x2="27" y2="29.8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1e24" />
          <stop offset="100%" stopColor="#0a0a0d" />
        </linearGradient>
        <linearGradient id="gitBranch" x1="11" y1="9" x2="21" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="shieldEdge" x1="5" y1="2.5" x2="27" y2="29.8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#52525b" />
          <stop offset="60%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Outer Shield Plate */}
      <path
        d="M16 2.5 L27 7.2 V15.5 C27 22.8 22.2 27.6 16 29.8 C9.8 27.6 5 22.8 5 15.5 V7.2 Z"
        fill="url(#shieldBg)"
        stroke="url(#shieldEdge)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Inner Defense Contour */}
      <path
        d="M16 5 L24.5 8.7 V15.2 C24.5 21.2 20.6 25.4 16 27.2 C11.4 25.4 7.5 21.2 7.5 15.2 V8.7 Z"
        fill="none"
        stroke="#27272a"
        strokeWidth="0.75"
        strokeOpacity="0.8"
      />

      {/* Git Flow Lines */}
      <path
        d="M16 9.5 C16 13 11 13 11 16 C11 19 16 19 16 22.5"
        stroke="url(#gitBranch)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.5 C16 13 21 13 21 16 C21 19 16 19 16 22.5"
        stroke="url(#gitBranch)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Commit Nodes */}
      <circle cx="16" cy="9.5" r="2.2" fill="#0a0a0d" stroke="#10b981" strokeWidth="1.5" />
      <circle cx="11" cy="16" r="2.2" fill="#0a0a0d" stroke="#34d399" strokeWidth="1.5" />
      <circle cx="21" cy="16" r="2.2" fill="#0a0a0d" stroke="#34d399" strokeWidth="1.5" />
      <circle cx="16" cy="22.5" r="2.2" fill="#10b981" stroke="#0a0a0d" strokeWidth="1" />

      {/* Center AI Synthesis Spark */}
      <path
        d="M16 13.8 L17.5 16 L16 18.2 L14.5 16 Z"
        fill="#ffffff"
        stroke="#10b981"
        strokeWidth="0.4"
      />
    </svg>
  );
}

export function GitArmorLogo({
  size = 'sm',
  showWordmark = true,
  tagline = false,
  className = '',
  lang = 'en'
}: GitArmorLogoProps) {
  const current = sizeMap[size];
  const isAr = lang === 'ar';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem with subtle shadow */}
      <div className="relative flex items-center justify-center filter drop-shadow-xs">
        <GitArmorEmblem size={current.box} />
      </div>

      {/* Wordmark Typography */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-neutral-950 dark:text-white ${current.text} font-sans`}>
              <span>Git</span>
              <span className="text-neutral-700 dark:text-neutral-300 font-semibold">Armor</span>
            </span>

            {/* Futuristic Tech Badge */}
            <span
              className={`font-mono font-bold tracking-wider uppercase rounded-md bg-neutral-100 dark:bg-neutral-850 text-neutral-800 dark:text-neutral-200 border border-neutral-300/80 dark:border-neutral-750 ${current.badge} shadow-2xs`}
            >
              AI
            </span>
          </div>

          {tagline && (
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono tracking-tight mt-0.5">
              {isAr ? 'منصة الأمان المستقل ومعالجة الثغرات' : 'Autonomous DevSecOps'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
