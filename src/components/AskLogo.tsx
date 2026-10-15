import React from 'react';
import ASK_LOGO_IMG from '../assets/images/ask_dairy_logo_1792059444506.jpg';

export interface AskLogoProps {
  variant?: 'mark' | 'horizontal' | 'stacked' | 'hero';
  theme?: 'dark' | 'light';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showTagline?: boolean;
  useImage?: boolean;
}

export const AskLogo: React.FC<AskLogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  className = '',
  showTagline = true,
  useImage = false,
}) => {
  // Size mapping for the emblem mark
  const markSizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
    '2xl': 'w-32 h-32 sm:w-40 sm:h-40',
  };

  const markSize = markSizeMap[size] || markSizeMap.md;

  // Crisp, scalable inline SVG Mark with prominent gold "ASK" typography
  const SvgMark = (
    <svg
      viewBox="0 0 500 500"
      className={`${markSize} shrink-0 drop-shadow-sm select-none transition-transform duration-300`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ASK Dairy Management Emblem"
      role="img"
    >
      <defs>
        {/* 3D Gold Foil Gradient */}
        <linearGradient id="askGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF5D6" />
          <stop offset="25%" stopColor="#F2D785" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="85%" stopColor="#A67C26" />
          <stop offset="100%" stopColor="#735212" />
        </linearGradient>

        <linearGradient id="askGoldLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Deep Forest Green Crest Gradient */}
        <radialGradient id="askGreenMedallion" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#1B6638" />
          <stop offset="45%" stopColor="#14532D" />
          <stop offset="85%" stopColor="#0D351D" />
          <stop offset="100%" stopColor="#071E10" />
        </radialGradient>

        {/* Emerald Ribbon Gradient */}
        <linearGradient id="askRibbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="20%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="80%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="askMilkIvory" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        <filter id="askFilterShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.4" />
        </filter>
        <filter id="askLetterShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      <g filter="url(#askFilterShadow)">
        {/* Outer Gold Medallion Rim */}
        <circle cx="250" cy="250" r="236" fill="url(#askGoldGrad)" stroke="#8C661D" strokeWidth="2" />
        <circle cx="250" cy="250" r="226" fill="#0A2215" stroke="url(#askGoldGrad)" strokeWidth="1.5" />

        {/* Milled Gold Coin Beads */}
        <circle cx="250" cy="250" r="221" fill="none" stroke="url(#askGoldLight)" strokeWidth="3" strokeDasharray="2.5 8" opacity="0.85" />

        {/* Inner Gold Rim & Deep Green Field */}
        <circle cx="250" cy="250" r="214" fill="none" stroke="url(#askGoldGrad)" strokeWidth="2" />
        <circle cx="250" cy="250" r="211" fill="url(#askGreenMedallion)" />
        <circle cx="250" cy="250" r="198" fill="none" stroke="url(#askGoldGrad)" strokeWidth="1" strokeDasharray="6 3" opacity="0.4" />

        {/* Triple Quality Stars */}
        <polygon points="190,78 193,87 202,87 195,92 198,101 190,95 182,101 185,92 178,87 187,87" fill="url(#askGoldLight)" opacity="0.9" />
        <polygon points="250,56 254,68 266,68 256,75 260,87 250,80 240,87 244,75 234,68 246,68" fill="url(#askGoldLight)" />
        <polygon points="310,78 313,87 322,87 315,92 318,101 310,95 302,101 305,92 298,87 307,87" fill="url(#askGoldLight)" opacity="0.9" />

        {/* PROMINENT BOLD 'ASK' BRAND LETTERING */}
        <g id="brand-letters" filter="url(#askLetterShadow)">
          {/* Hand-tuned Serif Vector Paths for 'A' */}
          <path
            d="M 124,196 L 152,196 L 146,182 L 176,112 L 182,112 L 206,182 L 200,196 L 226,196 L 226,186 L 216,184 L 188,102 L 170,102 L 134,184 L 124,186 Z"
            fill="url(#askGoldGrad)"
            stroke="#593E0A"
            strokeWidth="1.5"
          />
          <path d="M 153,158 L 197,158 L 194,147 L 156,147 Z" fill="url(#askGoldLight)" />
          {/* Milk Drop inside 'A' */}
          <path
            d="M 175,124 C 175,124 182,136 182,142 C 182,146 179,149 175,149 C 171,149 168,146 168,142 C 168,136 175,124 175,124 Z"
            fill="url(#askMilkIvory)"
          />

          {/* Hand-tuned Serif Vector Paths for 'S' */}
          <path
            d="M 276,128 C 274,116 264,103 248,103 C 232,103 220,113 220,126 C 220,140 232,146 248,152 C 267,158 281,166 281,181 C 281,194 269,203 250,203 C 231,203 218,193 216,177 L 233,174 C 235,183 242,190 250,190 C 258,190 264,185 264,178 C 264,169 253,163 238,157 C 221,150 205,142 205,126 C 205,111 218,91 247,91 C 268,91 285,103 289,124 Z"
            fill="url(#askGoldGrad)"
            stroke="#593E0A"
            strokeWidth="1.5"
          />

          {/* Hand-tuned Serif Vector Paths for 'K' */}
          <path
            d="M 292,196 L 322,196 L 322,186 L 313,184 L 313,114 L 322,112 L 322,102 L 292,102 L 292,112 L 301,114 L 301,184 L 292,186 Z"
            fill="url(#askGoldGrad)"
            stroke="#593E0A"
            strokeWidth="1.5"
          />
          <path
            d="M 312,149 L 348,114 L 339,112 L 339,102 L 368,102 L 368,112 L 358,114 L 327,143 L 348,184 L 359,186 L 359,196 L 333,196 L 318,162 L 312,168 Z"
            fill="url(#askGoldGrad)"
            stroke="#593E0A"
            strokeWidth="1.5"
          />

          {/* High-visibility Gold Text Layer for Maximum Clarity */}
          <text
            x="250"
            y="180"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', 'Cinzel', 'Georgia', 'Arial Black', serif"
            fontWeight="900"
            fontSize="82"
            letterSpacing="6"
            fill="url(#askGoldGrad)"
            stroke="#593E0A"
            strokeWidth="1.2"
            opacity="0.98"
          >ASK</text>
        </g>

        {/* Pasture Mound */}
        <path
          d="M 140,314 Q 250,296 360,314 Q 250,326 140,314 Z"
          fill="#0F4224"
          stroke="url(#askGoldGrad)"
          strokeWidth="1"
          opacity="0.8"
        />

        {/* Dairy Cow Silhouette */}
        <g id="cow-silhouette" transform="translate(162, 206) scale(0.44)" filter="url(#askLetterShadow)">
          <path
            d="M 50,140 C 50,132 55,124 64,120 C 72,116 88,110 102,108 C 114,106 128,96 140,88 C 150,80 162,72 176,70 C 188,68 196,72 206,78 C 216,74 228,74 238,80 C 248,86 254,98 256,112 C 262,118 276,134 286,150 C 292,160 292,176 286,186 C 280,196 268,196 260,192 L 254,214 C 250,226 242,230 234,228 L 226,186 C 212,190 196,192 180,192 C 162,198 146,204 126,204 L 118,256 C 114,264 106,268 98,264 L 94,208 C 86,208 78,202 72,192 L 58,256 C 54,264 46,268 38,264 L 40,186 C 32,182 26,170 26,158 C 26,144 34,132 48,126 Z"
            fill="url(#askMilkIvory)"
            stroke="#0D351D"
            strokeWidth="2.5"
          />
          <path
            d="M 120,118 C 134,118 144,128 142,142 C 140,154 128,162 116,158 C 104,154 98,140 102,130 C 106,122 112,118 120,118 Z"
            fill="#14532D"
          />
          <path
            d="M 180,110 C 196,110 206,122 204,138 C 202,150 190,160 178,156 C 166,152 162,138 166,124 C 170,114 174,110 180,110 Z"
            fill="#14532D"
          />
          <path
            d="M 230,126 C 242,126 250,136 248,148 C 246,158 238,166 228,162 C 218,158 214,146 218,136 C 220,130 224,126 230,126 Z"
            fill="#14532D"
          />
          <circle cx="160" cy="202" r="8" fill="#FDE68A" />
          <circle cx="174" cy="202" r="7" fill="#FDE68A" />
        </g>

        {/* Curved Emerald Ribbon for DAIRY MANAGEMENT */}
        <g id="ribbon">
          <path d="M 88,382 L 126,356 L 126,400 Z" fill="#034B36" />
          <path d="M 412,382 L 374,356 L 374,400 Z" fill="#034B36" />
          <path d="M 76,412 L 126,400 L 102,374 L 76,412 Z" fill="#023023" />
          <path d="M 424,412 L 374,400 L 398,374 L 424,412 Z" fill="#023023" />

          <path
            d="M 112,372 C 180,344 320,344 388,372 C 378,414 316,424 250,424 C 184,424 122,414 112,372 Z"
            fill="url(#askRibbonGrad)"
            stroke="url(#askGoldGrad)"
            strokeWidth="2.5"
          />
          <path
            d="M 124,374 C 185,352 315,352 376,374"
            fill="none"
            stroke="url(#askGoldLight)"
            strokeWidth="1.2"
            opacity="0.8"
          />

          <text
            x="250"
            y="398"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif"
            fontWeight="800"
            fontSize="19"
            letterSpacing="3.5"
            fill="#FFFFFF"
            filter="url(#askLetterShadow)"
          >DAIRY MANAGEMENT</text>
        </g>

        {/* Established year */}
        <g opacity="0.9">
          <circle cx="216" cy="442" r="2.5" fill="url(#askGoldLight)" />
          <text
            x="250"
            y="446"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="700"
            fontSize="11"
            letterSpacing="2.5"
            fill="url(#askGoldLight)"
          >EST. 2024</text>
          <circle cx="284" cy="442" r="2.5" fill="url(#askGoldLight)" />
        </g>
      </g>
    </svg>
  );

  // Raster Image Mark Option (for rich photographic emblem)
  const RasterMark = (
    <img
      src={ASK_LOGO_IMG}
      alt="ASK Dairy Management Logo"
      className={`${markSize} shrink-0 object-contain rounded-full shadow-md select-none transition-transform duration-300`}
      referrerPolicy="no-referrer"
    />
  );

  const MarkElement = useImage ? RasterMark : SvgMark;

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{MarkElement}</div>;
  }

  const isDark = theme === 'dark';
  const primaryTextColor = isDark ? 'text-white' : 'text-[#14532D]';
  const subtitleColor = isDark ? 'text-[#E5C77E]' : 'text-[#166534]';
  const taglineColor = isDark ? 'text-emerald-100/80' : 'text-neutral-500';

  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <div className="relative mb-4 sm:mb-5">
          {/* In hero view, high-resolution luxury emblem with radiant gold halo */}
          <img
            src={ASK_LOGO_IMG}
            alt="ASK Dairy Management"
            className={`${markSize} rounded-full shadow-2xl object-cover border-2 border-[#E5C77E]/80 ring-4 ring-[#14532D]/40`}
            referrerPolicy="no-referrer"
          />
          {/* Subtle gold backlight glow */}
          <div className="absolute inset-0 bg-[#E5C77E]/20 rounded-full blur-2xl pointer-events-none -z-10 transform scale-150" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans drop-shadow-md">
            ASK <span className="text-[#E5C77E]">DAIRY</span> MANAGEMENT
          </h1>
          <p className="text-[11px] sm:text-xs font-bold tracking-widest text-[#E5C77E] uppercase">
            Professional Farm ERP &middot; POS &middot; Accounting
          </p>
          {showTagline && (
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium tracking-wide pt-1">
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
        {MarkElement}
        <div className="mt-2 text-center">
          <span className={`text-sm font-extrabold tracking-wider ${primaryTextColor} block leading-tight`}>
            ASK DAIRY
          </span>
          <span className={`text-[10px] font-bold tracking-widest ${subtitleColor} uppercase block`}>
            MANAGEMENT ERP
          </span>
        </div>
      </div>
    );
  }

  // Default: 'horizontal'
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {MarkElement}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm sm:text-base font-extrabold tracking-tight ${primaryTextColor}`}>
            ASK <span className={isDark ? 'text-[#E5C77E]' : 'text-[#166534]'}>DAIRY</span>
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase ${
            isDark 
              ? 'bg-[#E5C77E]/20 text-[#E5C77E] border border-[#E5C77E]/30' 
              : 'bg-[#14532D]/10 text-[#14532D] border border-[#14532D]/20'
          }`}>
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
