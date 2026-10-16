import React from 'react';
import { Language } from '../i18n/translations';

interface FooterProps {
  lang?: Language;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="mt-auto bg-gradient-to-r from-[#0D3820] via-[#14532D] to-[#0D3820] text-emerald-100/90 border-t border-emerald-900/60 shadow-inner select-none py-2.5 px-3 pb-20 lg:pb-2.5 text-center">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-1.5 text-[11px] sm:text-xs font-sans tracking-wide">
        <span>Powered By M Salman Saleem</span>
        <span className="text-emerald-400/60">|</span>
        <a
          href="https://wa.me/923029075029"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E5C77E] hover:text-white font-medium transition-colors underline underline-offset-2 decoration-[#E5C77E]/50 hover:decoration-white"
        >
          WhatsApp +923029075029
        </a>
      </div>
    </footer>
  );
};
