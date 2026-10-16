import React, { useState, useEffect } from 'react';
import { AskLogo } from './AskLogo';
import DAIRY_PASTURE_BG from '../assets/images/dairy_morning_pasture_1791870140851.jpg';

interface BrandedStartupScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const BrandedStartupScreen: React.FC<BrandedStartupScreenProps> = ({
  onComplete,
  minDurationMs = 1600,
}) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing Farm ERP...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout> | null = null;

    // Step progression sequence for immersive branded initialization
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Syncing Herd Registry & Chiller Stocks...');
    }, 450);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Balancing Double-Entry Ledgers & Milk Flow...');
    }, 950);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('ASK Dairy Management Ready');
    }, 1400);

    const timerComplete = setTimeout(() => {
      setIsFadingOut(true);
      dismissTimer = setTimeout(() => {
        onComplete();
      }, 500); // Wait for fade-out transition
    }, minDurationMs);

    // Hard safety timeout: guaranteed dismissal after 3.5s max even if low-power mode pauses timers
    const safetyTimer = setTimeout(() => {
      onComplete();
    }, Math.max(minDurationMs + 1000, 3200));

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerComplete);
      clearTimeout(safetyTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [minDurationMs, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-500 bg-[#0E281C] ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. Full-screen Cinematic Dairy Pasture Photographic Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 motion-safe:animate-pulse transition-transform duration-1000"
        style={{
          backgroundImage: `url(${DAIRY_PASTURE_BG})`,
        }}
      />

      {/* 2. Deep Forest Green & Charcoal Vignette Scrim Overlays for Optimal Logo Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A12]/95 via-[#123D2B]/85 to-[#0E281C]/90 backdrop-blur-[1.5px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#091710_90%)] opacity-80" />

      {/* 3. Centered Branded Logo and Typography */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 max-w-lg w-full text-center">
        {/* Custom ASK Monogram with Champagne Gold Accents */}
        <AskLogo
          variant="hero"
          theme="dark"
          size="xl"
          showTagline={true}
          className="mb-6 drop-shadow-xl"
        />

        {/* Elegant Animated Progress Bar & Status Text */}
        <div className="w-64 sm:w-80 mt-2 space-y-2.5">
          <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden backdrop-blur-xs border border-[#C7A45D]/30">
            <div
              className="h-full bg-gradient-to-r from-[#1F8A5B] via-[#C7A45D] to-[#F3DC9B] transition-all duration-300 ease-out rounded-full shadow-[0_0_8px_rgba(199,164,93,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/70 font-mono tracking-wide px-1">
            <span className="truncate">{statusText}</span>
            <span className="text-[#C7A45D] font-bold tabular-nums">{progress}%</span>
          </div>
        </div>

        {/* Quick Skip Touch / Click Affordance */}
        <button
          onClick={handleSkip}
          className="mt-8 text-[11px] text-[#C7A45D]/80 hover:text-white transition-colors tracking-widest uppercase font-semibold underline underline-offset-4 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C7A45D] rounded px-2 py-1"
        >
          Enter Dashboard &rarr;
        </button>
      </div>

      {/* Bottom Subtle Developer Credit Badge */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-[11px] text-white/80 tracking-wide font-medium flex flex-wrap items-center justify-center gap-2 px-4">
        <span className="text-amber-300 font-medium">Powered by:</span>
        <span className="text-white font-bold">M Salman Saleem</span>
        <span className="text-white/40">&bull;</span>
        <span className="text-emerald-300 font-mono font-semibold">WhatsApp: +923029075029</span>
      </div>
    </div>
  );
};
