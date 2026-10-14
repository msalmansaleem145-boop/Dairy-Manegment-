import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Calendar, 
  User, 
  Building2, 
  ChevronDown, 
  Sparkles,
  Plus,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AskLogo } from './AskLogo';
import { UserRole, FarmBranch } from '../types';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenQuickAction: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  branches: FarmBranch[];
  selectedBranchId: string;
  onSelectBranch: (id: string) => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
}

const tabBreadcrumbTitles: Record<string, { en: string; ur: string }> = {
  dashboard: { en: 'Dashboard & KPIs', ur: 'ڈیش بورڈ اور اہم اعداد و شمار' },
  animals: { en: 'Animal Herd Registry', ur: 'مویشیوں کا مکمل ریکارڈ' },
  milkProduction: { en: 'Daily Milk Collection', ur: 'روزانہ دودھ کی پیداوار' },
  reconciliation: { en: 'Milk Allocation & Reconciliation', ur: 'دودھ کا بیلنس اور چیلر حساب' },
  posBilling: { en: 'POS Counter & Billing', ur: 'پی او ایس کاؤنٹر اور بلنگ' },
  customers: { en: 'Customer Ledgers & Khata', ur: 'کسٹمرز اور کھاتہ جات' },
  processing: { en: 'Dairy Value Addition', ur: 'گھی، دہی اور پروسیسنگ' },
  inventoryFeed: { en: 'Feed Rations & Inventory', ur: 'خوراک، ونڈا اور گودام' },
  vetBreeding: { en: 'Veterinary & AI Breeding', ur: 'طبی معائنہ اور نسل کشی' },
  accounting: { en: 'Double-Entry Accounting & P&L', ur: 'مالی کھاتے اور نفع نقصان' },
  employees: { en: 'Staff & Payroll Management', ur: 'ملازمین اور تنخواہیں' },
  reports: { en: 'Business Reports & Analytics', ur: 'کاروباری رپورٹس' },
  settings: { en: 'Farm Setup & Configuration', ur: 'فارم سیٹنگز' }
};

const roleDisplayNames: Record<UserRole, { en: string; ur: string }> = {
  super_admin: { en: 'Super Admin', ur: 'سپر ایڈمن' },
  farm_owner: { en: 'Farm Owner', ur: 'فارم مالک' },
  farm_manager: { en: 'Farm Manager', ur: 'فارم مینیجر' },
  accountant: { en: 'Accountant', ur: 'اکاؤنٹنٹ' },
  milk_operator: { en: 'Milk Operator', ur: 'دودھ آپریٹر' },
  pos_operator: { en: 'POS Cashier', ur: 'کیشیئر' },
  veterinarian: { en: 'Veterinarian (DVM)', ur: 'ڈاکٹر جانور' },
  inventory_manager: { en: 'Inventory Manager', ur: 'اسٹور انچارج' }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenQuickAction,
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount,
  branches,
  selectedBranchId,
  onSelectBranch,
  currentRole,
  onChangeRole,
  lang,
  onToggleLang
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const pageTitle = tabBreadcrumbTitles[currentTab] ? (lang === 'ur' ? tabBreadcrumbTitles[currentTab].ur : tabBreadcrumbTitles[currentTab].en) : 'Dashboard';

  const todayFormatted = new Intl.DateTimeFormat(lang === 'ur' ? 'ur-PK' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 shadow-2xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left Zone: Brand + Breadcrumb Navigation */}
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            {/* Logo Link */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('dashboard');
              }}
              className="shrink-0 focus:outline-none flex items-center gap-2 group cursor-pointer"
              aria-label="ASK Dairy Management"
            >
              <AskLogo variant="horizontal" size="sm" />
            </a>

            {/* Breadcrumb Trail */}
            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 border-l border-neutral-200 pl-4 py-1">
              <span className="font-semibold text-neutral-400">ASK ERP</span>
              <span className="text-neutral-300">/</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 truncate max-w-[180px]">
                {pageTitle}
              </span>
            </div>
          </div>

          {/* Center Zone: Global Search Bar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden sm:block">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-neutral-100/80 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-500 hover:text-neutral-800 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-700 transition-colors shrink-0" />
                <span className="truncate">Search animals (PK-), customers, feed, POS...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-neutral-500 bg-white border border-neutral-200 rounded shadow-2xs shrink-0">
                ⌘K / Search
              </kbd>
            </button>
          </div>

          {/* Right Zone: Controls, Date, Notifications & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile Search Icon */}
            <button
              onClick={onOpenSearch}
              className="sm:hidden p-2 text-neutral-600 hover:text-emerald-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              title="Search ERP"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Current Date Display */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-neutral-500 px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-200/60 font-mono">
              <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{todayFormatted}</span>
            </div>

            {/* Notification Bell with Unread Badge */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              title="Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Quick Action Button */}
            <button
              onClick={onOpenQuickAction}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#14532D] to-[#16A34A] hover:from-[#0f4022] hover:to-[#138a3e] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-200" />
              <span>Quick Action</span>
            </button>

            {/* User Profile Menu Button */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors border border-transparent hover:border-neutral-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#14532D] to-[#16A34A] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {currentRole === 'super_admin' ? 'SA' : currentRole.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-bold text-neutral-900 leading-tight">
                    {lang === 'ur' ? 'سلمان سلیم' : 'M Salman Saleem'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold leading-tight">
                    {lang === 'ur' ? roleDisplayNames[currentRole].ur : roleDisplayNames[currentRole].en}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden lg:block" />
              </button>

              {/* User Profile Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3 border-b border-neutral-100">
                    <div className="font-bold text-neutral-900 text-xs">M Salman Saleem</div>
                    <div className="text-[11px] text-neutral-500">msalmansaleem145@gmail.com</div>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      <span>{lang === 'ur' ? roleDisplayNames[currentRole].ur : roleDisplayNames[currentRole].en}</span>
                    </div>
                  </div>

                  {/* Switch Role Inside Menu */}
                  <div className="py-2 px-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 block mb-1">
                      {lang === 'ur' ? 'کردار تبدیل کریں' : 'Switch Active Role'}
                    </span>
                    {(Object.keys(roleDisplayNames) as UserRole[]).slice(0, 4).map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          onChangeRole(role);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          currentRole === role
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <span>{lang === 'ur' ? roleDisplayNames[role].ur : roleDisplayNames[role].en}</span>
                        {currentRole === role && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between px-2 text-xs">
                    <button
                      onClick={() => {
                        onToggleLang(lang === 'en' ? 'ur' : 'en');
                        setUserMenuOpen(false);
                      }}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      {lang === 'en' ? 'اردو میں دیکھیں' : 'Switch to English'}
                    </button>
                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
