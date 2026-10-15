import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Building2, 
  ChevronDown, 
  Plus, 
  ShieldCheck, 
  Check,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  Menu,
  Clock,
  Sun,
  Moon,
  Sparkles,
  Milk,
  ShoppingBag
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
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  onSync: () => void;
  onToggleMobileSidebar: () => void;
}

const tabBreadcrumbTitles: Record<string, { en: string; ur: string }> = {
  dashboard: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  animals: { en: 'Animal Management', ur: 'مویشی انتظام' },
  milkProduction: { en: 'Milk Collection', ur: 'دودھ اندراج' },
  reconciliation: { en: 'Chiller & Reports', ur: 'چیلر رپورٹ' },
  posBilling: { en: 'POS Billing', ur: 'پی او ایس' },
  customers: { en: 'Customer Ledger', ur: 'کسٹمر کھاتہ' },
  processing: { en: 'Dairy Processing', ur: 'پروسیسنگ' },
  inventoryFeed: { en: 'Inventory & Feed', ur: 'اسٹاک و فیڈ' },
  vetBreeding: { en: 'Veterinary & Breeding', ur: 'طبی معائنہ' },
  accounting: { en: 'Financial Accounting', ur: 'مالیات و کھاتہ' },
  employees: { en: 'Employees & Payroll', ur: 'ملازمین' },
  reports: { en: 'Analytics & Reports', ur: 'تجزیات' },
  settings: { en: 'System Settings', ur: 'ترتیبات' }
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
  onToggleLang,
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  onSync,
  onToggleMobileSidebar
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const branchMenuRef = useRef<HTMLDivElement>(null);
  const quickNavRef = useRef<HTMLDivElement>(null);

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const pageTitle = tabBreadcrumbTitles[currentTab] 
    ? (lang === 'ur' ? tabBreadcrumbTitles[currentTab].ur : tabBreadcrumbTitles[currentTab].en) 
    : 'Dashboard';

  // Live real-time clock (updates every 10 seconds for clean efficiency)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Determine current active dairy shift
  const currentHour = currentTime.getHours();
  const isMorningShift = currentHour >= 5 && currentHour < 14;
  const isEveningShift = currentHour >= 14 && currentHour < 22;
  const currentShiftLabel = isMorningShift 
    ? (lang === 'ur' ? 'صبح کی شفٹ' : 'Morning Shift')
    : isEveningShift 
    ? (lang === 'ur' ? 'شام کی شفٹ' : 'Evening Shift')
    : (lang === 'ur' ? 'نائٹ کیئر' : 'Night Care');

  // Format real-time date string
  const formattedTimeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDateStr = currentTime.toLocaleDateString([], { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (branchMenuRef.current && !branchMenuRef.current.contains(event.target as Node)) {
        setBranchMenuOpen(false);
      }
      if (quickNavRef.current && !quickNavRef.current.contains(event.target as Node)) {
        setQuickNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#14532D] via-[#166534] to-[#0B3D23] text-white border-b border-emerald-900/60 shadow-md select-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* Main Header Bar (56px) */}
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-3">
          
          {/* Left Zone: Hamburger + Brand Logo + Farm Branch Selector */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Menu Hamburger */}
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Brand Logo Link with Official ASK Monogram */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('dashboard');
              }}
              className="shrink-0 flex items-center gap-2.5 focus:outline-none cursor-pointer group"
              aria-label="ASK Dairy Management"
            >
              {/* Desktop Full Monogram & Wordmark */}
              <div className="hidden sm:flex items-center gap-2.5">
                <AskLogo variant="mark" size="sm" theme="dark" />
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-sm tracking-tight text-white leading-tight font-sans">
                    ASK <span className="text-[#E5C77E]">DAIRY</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-200/90 tracking-wider uppercase font-mono leading-none">
                    Management ERP
                  </span>
                </div>
              </div>

              {/* Mobile Compact Monogram Mark */}
              <div className="sm:hidden flex items-center gap-1.5">
                <AskLogo variant="mark" size="xs" theme="dark" />
                <span className="font-extrabold text-xs tracking-tight text-white font-sans">
                  ASK <span className="text-[#E5C77E]">DAIRY</span>
                </span>
              </div>
            </a>

            {/* Farm Branch Dropdown */}
            <div className="relative" ref={branchMenuRef}>
              <button
                onClick={() => setBranchMenuOpen(!branchMenuOpen)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 border border-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
                title="Select Active Farm Branch"
              >
                <Building2 className="w-3.5 h-3.5 text-[#E5C77E] shrink-0" />
                <span className="truncate max-w-[120px] lg:max-w-[150px] font-medium text-emerald-100">
                  {activeBranch.code}
                </span>
                <ChevronDown className="w-3 h-3 text-white/70 shrink-0" />
              </button>

              {branchMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white text-neutral-900 rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {lang === 'ur' ? 'فعال ڈیری فارم' : 'Active Dairy Farm'}
                  </div>
                  {branches.map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBranch(b.id);
                        setBranchMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        selectedBranchId === b.id
                          ? 'bg-emerald-50 text-emerald-950 font-bold'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate font-semibold">{b.name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">{b.location}</div>
                      </div>
                      {selectedBranchId === b.id && <Check className="w-3.5 h-3.5 text-[#14532D] shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shift & Time-of-day indicator (Morning/Evening Shift) */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-semibold text-[#E5C77E]">
              {isMorningShift ? (
                <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
              )}
              <span className="font-mono">{currentShiftLabel}</span>
            </div>
          </div>

          {/* Center Zone: Quick Search Bar */}
          <div className="flex-1 max-w-xs sm:max-w-sm mx-1 sm:mx-2">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 border border-white/15 text-xs text-emerald-100/80 hover:text-white transition-all cursor-pointer group"
              aria-label="Search records"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-emerald-300 group-hover:text-white transition-colors shrink-0" />
                <span className="truncate text-xs">
                  {lang === 'ur' ? 'تلاش کریں (مویشی، بل، کسٹمر)...' : 'Search cattle, khata, sales...'}
                </span>
              </div>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-emerald-200 bg-white/10 border border-white/20 rounded shadow-2xs shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Zone: Live Date/Time, Quick Actions, Network Sync, Alerts, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Live Clock & Date (Desktop) */}
            <div className="hidden 2xl:flex items-center gap-1.5 text-[11px] font-mono text-emerald-100/90 px-2.5 py-1 rounded-lg bg-black/15 border border-white/10">
              <Clock className="w-3 h-3 text-[#E5C77E]" />
              <span>{formattedDateStr}</span>
              <span className="text-white/40">·</span>
              <span className="font-bold text-white tabular-nums">{formattedTimeStr}</span>
            </div>

            {/* Quick Action Buttons Strip (Add Milk, Add Animal, POS) */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => onNavigate('milkProduction')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-white transition-colors cursor-pointer"
                title="Record Milk Collection Shift"
              >
                <Milk className="w-3 h-3 text-emerald-300" />
                <span>+ Milk</span>
              </button>

              <button
                onClick={() => onNavigate('posBilling')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-white transition-colors cursor-pointer"
                title="Open POS Billing Counter"
              >
                <ShoppingBag className="w-3 h-3 text-amber-300" />
                <span>+ POS</span>
              </button>
            </div>

            {/* Master Action Trigger Button */}
            <button
              onClick={onOpenQuickAction}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#E5C77E] to-[#C7A45D] hover:from-[#F3DC9B] hover:to-[#D4B36A] text-[#143929] text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95"
              title="New Farm Entry / Quick Action"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline font-sans">Action</span>
            </button>

            {/* Online / Offline Sync Indicator */}
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleOffline}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
                  isOffline
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/40'
                    : 'bg-emerald-950/40 text-emerald-200 border-emerald-500/30'
                }`}
                title={isOffline ? 'Offline Mode (Click to toggle)' : 'Online Connected (Click to simulate offline)'}
              >
                {isOffline ? (
                  <WifiOff className="w-3 h-3 text-amber-300" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <span className="hidden md:inline font-mono">
                  {isOffline ? 'Offline' : 'Online'}
                </span>
              </button>

              {pendingSyncCount > 0 && (
                <button
                  onClick={onSync}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border border-blue-400/40 text-[11px] font-mono font-bold cursor-pointer transition-colors"
                  title="Sync Pending Offline Changes"
                >
                  <RefreshCw className="w-3 h-3 text-blue-300 animate-spin" />
                  <span>{pendingSyncCount}</span>
                </button>
              )}
            </div>

            {/* Notification Center Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Operational Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-[#14532D]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Language Toggle (EN / UR) */}
            <button
              onClick={() => onToggleLang(lang === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 hover:bg-black/30 border border-white/15 text-[11px] font-bold text-white transition-colors cursor-pointer"
              title="Toggle English / اردو"
            >
              <Globe className="w-3 h-3 text-[#E5C77E]" />
              <span className="font-mono">{lang === 'en' ? 'UR' : 'EN'}</span>
            </button>

            {/* User Profile & Role Switcher */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/15"
                title="User Profile & Role"
              >
                <div className="w-7 h-7 rounded-md bg-[#E5C77E] text-[#14532D] flex items-center justify-center font-black text-xs shadow-2xs">
                  {currentRole === 'super_admin' ? 'SA' : currentRole.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs leading-none">
                  <div className="font-bold text-white truncate max-w-[100px]">
                    {lang === 'ur' ? 'سلمان سلیم' : 'Salman Saleem'}
                  </div>
                  <div className="text-[10px] text-emerald-200 font-semibold mt-0.5">
                    {lang === 'ur' ? roleDisplayNames[currentRole].ur : roleDisplayNames[currentRole].en}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-white/70 hidden lg:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white text-neutral-900 rounded-xl shadow-2xl border border-neutral-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2.5 border-b border-neutral-100">
                    <div className="font-bold text-neutral-900 text-xs">M Salman Saleem</div>
                    <div className="text-[11px] text-neutral-500 font-mono">msalmansaleem145@gmail.com</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 text-[10px] font-bold border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-[#14532D]" />
                      <span>{lang === 'ur' ? roleDisplayNames[currentRole].ur : roleDisplayNames[currentRole].en}</span>
                    </div>
                  </div>

                  {/* Switch Role Inside Menu */}
                  <div className="py-1.5 px-1 max-h-56 overflow-y-auto">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 block mb-1">
                      {lang === 'ur' ? 'کردار تبدیل کریں' : 'Switch Active Role'}
                    </span>
                    {(Object.keys(roleDisplayNames) as UserRole[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          onChangeRole(role);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                          currentRole === role
                            ? 'bg-emerald-50 text-emerald-950 font-bold'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <span>{lang === 'ur' ? roleDisplayNames[role].ur : roleDisplayNames[role].en}</span>
                        {currentRole === role && <Check className="w-3.5 h-3.5 text-[#14532D]" />}
                      </button>
                    ))}
                  </div>

                  {/* Footer & Developer Credits */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between px-2 text-xs">
                    <button
                      onClick={() => {
                        onToggleLang(lang === 'en' ? 'ur' : 'en');
                        setUserMenuOpen(false);
                      }}
                      className="text-[#14532D] font-bold hover:underline"
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
