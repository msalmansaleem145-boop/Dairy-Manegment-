import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink,
  Code2,
  Heart
} from 'lucide-react';
import { Language } from '../i18n/translations';
import { AskLogo } from './AskLogo';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const [copied, setCopied] = useState(false);
  const rawNumber = '+923029075029';
  const cleanNumber = '923029075029';
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    'Assalam-o-Alaikum M Salman Saleem, I am contacting you regarding ASK Dairy Management System.'
  )}`;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(rawNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-r from-[#071E14] via-[#0E3D2B] via-[#0B3546] to-[#141E30] text-white shadow-2xl select-none">
      {/* 1. Ultra-vibrant top glowing rainbow/aurora strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 via-teal-300 via-cyan-400 via-purple-400 to-rose-400 animate-gradient" />

      {/* 2. Colorful background blur light accents */}
      <div className="absolute -top-12 left-10 w-72 h-36 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-28 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-80 h-36 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-14 left-1/3 w-64 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Colorful Hero Banner in Footer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Left: Brand Identity with Gold/Emerald touches */}
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/30 to-amber-500/30 border border-white/20 shadow-inner shrink-0">
                <AskLogo variant="mark" size="sm" />
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-black text-base sm:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-200 to-teal-100">
                    ASK DAIRY MANAGEMENT
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 shadow-sm">
                    PRO ERP
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  {lang === 'ur'
                    ? 'جدید ترین ڈیری فارم، ملک پروڈکشن، پی او ایس بلنگ اور اکاؤنٹنگ سسٹم'
                    : 'Next-Gen Dairy Farm Operations, POS Billing & Financial Accounting'}
                </p>
              </div>
            </div>

            {/* Center / Right: Colorful Developer & WhatsApp Spotlight */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-center lg:justify-end">
              
              {/* Colorful "Powered by: M Salman Saleem" Card */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-emerald-900/40 border border-cyan-400/40 shadow-lg backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-neutral-950 font-black shadow-md shrink-0">
                  <Code2 className="w-4 h-4 text-neutral-950" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-medium text-cyan-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Powered by:</span>
                  </div>
                  <div className="text-sm font-extrabold text-white tracking-wide">
                    M Salman Saleem
                  </div>
                </div>
              </div>

              {/* Colorful Glowing WhatsApp Action Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#25D366] via-[#20ba59] to-[#128C7E] hover:from-[#28e36e] hover:to-[#18a36d] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-900/40 hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-emerald-300/40"
                title="Connect on WhatsApp: +923029075029"
              >
                {/* Pulsing online indicator */}
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>

                <MessageCircle className="w-4 h-4 text-white fill-white/20 shrink-0 group-hover:scale-110 transition-transform" />
                
                <span className="tracking-wide">WhatsApp:</span>
                <span className="font-mono font-black text-xs sm:text-sm px-2 py-0.5 rounded-md bg-black/30 tracking-wider text-amber-200 border border-white/20">
                  +923029075029
                </span>

                <ExternalLink className="w-3.5 h-3.5 text-white/80 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* Quick Copy Number Button */}
              <button
                type="button"
                onClick={handleCopyNumber}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
                title="Copy phone number"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-300" />
                    <span>Copy</span>
                  </>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* Feature Badges & Direct Dialing Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-white/10">
          {/* Left Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {lang === 'ur' ? '24/7 واٹس ایپ سپورٹ دستیاب' : '24/7 WhatsApp Support'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>Full Dairy ERP & POS</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-400/30 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tailored for Pakistani Farms</span>
            </span>
          </div>

          {/* Right Direct Call & Copyright */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/70">
            <a
              href="tel:+923029075029"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono transition-colors"
            >
              <Phone className="w-3 h-3 text-[#25D366]" />
              <span>+92 302 9075029</span>
            </a>

            <div className="flex items-center gap-1 text-white/60">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline" />
              <span>for Livestock Prosperity</span>
            </div>

            <span className="text-white/40">&copy; {new Date().getFullYear()} ASK Dairy Management</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
