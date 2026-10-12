import React from 'react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenQuickAction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenQuickAction
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-neutral-200 sticky top-0 z-40">
      {/* Zone 1: Brand title, single element, no nested pills or taglines */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('dashboard');
        }}
        className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 flex items-center gap-2.5"
      >
        <span className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm tracking-wider">
          ASK
        </span>
        <span>ASK Dairy Management</span>
      </a>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'dashboard' ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700 py-1' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('milkProduction')}
          className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'milkProduction' ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700 py-1' : ''
          }`}
        >
          Milk Production
        </button>
        <button
          onClick={() => onNavigate('posBilling')}
          className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'posBilling' ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700 py-1' : ''
          }`}
        >
          POS Counter
        </button>
        <button
          onClick={() => onNavigate('animals')}
          className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'animals' ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700 py-1' : ''
          }`}
        >
          Herd Registry
        </button>
        <button
          onClick={() => onNavigate('accounting')}
          className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'accounting' ? 'text-emerald-800 font-semibold border-b-2 border-emerald-700 py-1' : ''
          }`}
        >
          Accounting
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenQuickAction}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
        >
          Quick Action
        </button>
      </div>
    </header>
  );
};
