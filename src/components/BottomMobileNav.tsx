import React from 'react';
import {
  LayoutDashboard,
  Milk,
  ShoppingBag,
  ShieldCheck,
  Menu,
  PlusCircle
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface BottomMobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMobileDrawer: () => void;
  onOpenQuickAction: () => void;
  unreadNotificationsCount?: number;
  lang: Language;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileDrawer,
  onOpenQuickAction,
  unreadNotificationsCount = 0,
  lang
}) => {
  const tabs = [
    {
      id: 'dashboard',
      label: lang === 'ur' ? 'ڈیش بورڈ' : 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'milkProduction',
      label: lang === 'ur' ? 'دودھ' : 'Milk',
      icon: Milk
    },
    {
      id: 'quick_action',
      label: lang === 'ur' ? 'نیا اندراج' : 'Action',
      icon: PlusCircle,
      isAction: true
    },
    {
      id: 'posBilling',
      label: lang === 'ur' ? 'پی او ایس' : 'POS',
      icon: ShoppingBag
    },
    {
      id: 'more',
      label: lang === 'ur' ? 'مینو' : 'Menu',
      icon: Menu,
      isDrawer: true
    }
  ];

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-1.5 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] select-none"
      aria-label="Mobile Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={onOpenQuickAction}
                className="flex flex-col items-center justify-center -mt-4 group cursor-pointer focus:outline-none"
                aria-label="New Quick Action"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#14532D] to-[#16A34A] text-white flex items-center justify-center shadow-md shadow-[#14532D]/30 group-active:scale-95 transition-transform border-2 border-white">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#14532D] mt-0.5 truncate max-w-[62px]">
                  {tab.label}
                </span>
              </button>
            );
          }

          if (tab.isDrawer) {
            return (
              <button
                key={tab.id}
                onClick={onOpenMobileDrawer}
                className="min-h-[44px] flex flex-col items-center justify-center text-neutral-500 hover:text-neutral-900 active:scale-95 transition-transform cursor-pointer relative"
                aria-label="Open Full Navigation Menu"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-[62px]">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'text-[#14532D] font-bold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              aria-label={tab.label}
            >
              <div className={`p-1 rounded-xl transition-all ${
                isActive ? 'bg-[#14532D]/10 scale-105' : ''
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#14532D]' : 'text-neutral-500'}`} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 truncate max-w-[62px] ${
                isActive ? 'font-bold text-[#14532D]' : 'font-medium text-neutral-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
