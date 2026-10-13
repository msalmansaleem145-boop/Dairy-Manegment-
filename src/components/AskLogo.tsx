import React from 'react';

export interface AskLogoProps {
  variant?: 'mark' | 'horizontal' | 'stacked' | 'hero';
  theme?: 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const AskLogo: React.FC<AskLogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  // Size mapping for the mark
  const markSizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const markSize = markSizeMap[size];

  // The inline SVG Mark ensures instantaneous rendering without asset fetching delays
  const SvgMark = (
    <svg
      viewBox="0 0 400 400"
      className={`${markSize} shrink-0 drop-shadow-sm select-none transition-transform duration-300`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#123D2B" />
          <stop offset="60%" stopColor="#0E2B1E" />
          <stop offset="100%" stopColor="#17221D" />
        </linearGradient>

        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F3DC9B" />
          <stop offset="50%" stopColor="#C7A45D" />
          <stop offset="100%" stopColor="#9E7B35" />
        </linearGradient>

        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2EC480" />
          <stop offset="50%" stopColor="#1F8A5B" />
          <stop offset="100%" stopColor="#125939" />
        </linearGradient>

        <linearGradient id="milkDropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F7F5EF" />
          <stop offset="100%" stopColor="#E2DDD0" />
        </linearGradient>

        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer Laurel / Gold Geometric Rings */}
      <circle cx="200" cy="200" r="188" stroke="url(#goldGrad)" strokeWidth="3" opacity="0.9" />
      <circle cx="200" cy="200" r="179" stroke="#C7A45D" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />

      {/* Main Heraldic Shield */}
      <path
        d="M 200,32 C 285,32 356,88 356,176 C 356,268 280,332 200,366 C 120,332 44,268 44,176 C 44,88 115,32 200,32 Z"
        fill="url(#shieldGrad)"
        stroke="url(#goldGrad)"
        strokeWidth="4.5"
        filter="url(#logoShadow)"
      />

      {/* Inner Emerald Border */}
      <path
        d="M 200,44 C 276,44 340,94 340,174 C 340,256 270,316 200,348 C 130,316 60,256 60,174 C 60,94 124,44 200,44 Z"
        stroke="#1F8A5B"
        strokeWidth="2"
        opacity="0.75"
      />

      {/* Triple Quality Stars */}
      <polygon points="120,68 123,76 131,76 125,81 127,89 120,84 113,89 115,81 109,76 117,76" fill="#C7A45D" />
      <polygon points="200,52 203,60 211,60 205,65 207,73 200,68 193,73 195,65 189,60 197,60" fill="#F3DC9B" />
      <polygon points="280,68 283,76 291,76 285,81 287,89 280,84 273,89 275,81 269,76 277,76" fill="#C7A45D" />

      {/* Letter 'A' Arch and Crossbar */}
      <path
        d="M 200,72 L 272,216 L 246,216 L 200,122 L 154,216 L 128,216 Z"
        fill="url(#goldGrad)"
      />

      {/* Stylized Milk Drop in Apex of 'A' */}
      <path
        d="M 200,110 C 200,110 216,134 216,150 C 216,159 209,166 200,166 C 191,166 184,159 184,150 C 184,134 200,110 200,110 Z"
        fill="url(#milkDropGrad)"
      />

      {/* Letter 'S' Flowing Pasture Ribbon */}
      <path
        d="M 226,174 C 218,168 206,166 195,166 C 176,166 164,175 164,188 C 164,204 180,210 202,216 C 228,223 244,233 244,254 C 244,278 222,294 192,294 C 172,294 154,286 142,274 L 156,256 C 166,268 180,274 194,274 C 208,274 218,266 218,255 C 218,241 202,235 182,229 C 158,222 140,212 140,189 C 140,166 160,150 193,150 C 210,150 224,156 236,164 Z"
        fill="url(#emeraldGrad)"
      />

      {/* Letter 'K' Diagonal Branches */}
      <path
        d="M 252,176 L 274,176 L 236,228 L 278,288 L 254,288 L 222,242 L 238,220 Z"
        fill="url(#goldGrad)"
      />

      {/* Refined Dairy Cow Silhouette */}
      <g transform="translate(142, 276) scale(0.29)" fill="#F7F5EF" opacity="0.95">
        <path d="M 120,40 C 126,38 136,36 148,34 C 156,33 162,35 168,40 C 174,38 180,38 186,41 C 192,45 194,52 195,60 C 200,64 210,74 216,84 C 220,90 220,100 216,106 C 212,112 204,112 198,110 L 194,124 C 192,132 186,134 180,132 L 174,106 C 164,108 152,110 140,110 C 128,114 116,118 102,118 L 96,152 C 94,158 88,160 82,158 L 80,120 C 74,120 68,116 64,110 L 54,152 C 52,158 46,160 40,158 L 42,108 C 36,106 32,98 32,90 C 32,80 38,72 48,68 C 58,64 74,60 90,56 C 102,52 112,44 120,40 Z" />
      </g>

      {/* Base Ribbon Trim Arc */}
      <path d="M 148,328 Q 200,344 252,328" stroke="url(#goldGrad)" strokeWidth="2" fill="none" />
      <circle cx="200" cy="336" r="3" fill="#F3DC9B" />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{SvgMark}</div>;
  }

  const isDark = theme === 'dark';
  const primaryTextColor = isDark ? 'text-white' : 'text-[#123D2B]';
  const subtitleColor = isDark ? 'text-[#C7A45D]' : 'text-[#1F8A5B]';
  const taglineColor = isDark ? 'text-[#F7F5EF]/70' : 'text-neutral-500';

  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <div className="relative mb-4 sm:mb-5">
          {SvgMark}
          {/* Subtle gold backlight glow */}
          <div className="absolute inset-0 bg-[#C7A45D]/15 rounded-full blur-2xl pointer-events-none -z-10 transform scale-150" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans drop-shadow-md">
            ASK <span className="text-[#E5C77E]">DAIRY</span> MANAGEMENT
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#E5C77E] uppercase">
            Professional Farm ERP &middot; POS &middot; Accounting
          </p>
          {showTagline && (
            <p className="text-xs text-white/80 font-medium tracking-wide pt-1">
              Smart Farming. Better Dairy.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {SvgMark}
        <div className="mt-2 text-center">
          <span className={`text-sm font-extrabold tracking-wider ${primaryTextColor} block leading-tight`}>
            ASK DAIRY
          </span>
          <span className={`text-[10px] font-semibold tracking-widest ${subtitleColor} uppercase block`}>
            MANAGEMENT
          </span>
        </div>
      </div>
    );
  }

  // Default: 'horizontal'
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {SvgMark}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm sm:text-base font-extrabold tracking-tight ${primaryTextColor}`}>
            ASK DAIRY
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded tracking-widest uppercase bg-[#123D2B]/10 text-[#123D2B] border border-[#123D2B]/20`}>
            ERP
          </span>
        </div>
        <span className={`text-[10px] font-semibold tracking-wider ${subtitleColor} uppercase`}>
          Management Platform
        </span>
      </div>
    </div>
  );
};
