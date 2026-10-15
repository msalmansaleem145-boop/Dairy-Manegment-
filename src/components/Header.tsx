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
  Sparkles
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
  animals: { en: 'Animals', ur: 'مویشی' },
  milkProduction: { en: 'Milk Collection', ur: 'دودھ اندراج' },
  reconciliation: { en: 'Milk Reports', ur: 'چیلر رپورٹ' },
  posBilling: { en: 'POS Billing', ur: 'پی او ایس' },
  customers: { en: 'Customers', ur: 'کسٹمر کھاتہ' },
  processing: { en: 'Processing', ur: 'پروسیسنگ' },
  inventoryFeed: { en: 'Inventory', ur: 'اسٹاک و فیڈ' },
  vetBreeding: { en: 'Vet & Breeding', ur: 'طبی معائنہ' },
  accounting: { en: 'Accounting', ur: 'مالیات' },
  employees: { en: 'Employees', ur: 'ملازمین' },
  reports: { en: 'Analytics', ur: 'تجزیات' },
  settings: { en: 'Settings', ur: 'ترتیبات' }
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
  const userMenuRef = useRef<HTMLDivElement>(null);
  const branchMenuRef = useRef<HTMLDivElement>(null);

  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const pageTitle = tabBreadcrumbTitles[currentTab] 
    ? (lang === 'ur' ? tabBreadcrumbTitles[currentTab].ur : tabBreadcrumbTitles[currentTab].en) 
    : 'Dashboard';

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (branchMenuRef.current && !branchMenuRef.current.contains(event.target as Node)) {
        setBranchMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200/90 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
          
          {/* Left Zone: Hamburger + Brand + Farm Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Menu Hamburger */}
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5 text-neutral-700" />
            </button>

            {/* Brand Logo Link */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('dashboard');
              }}
              className="shrink-0 flex items-center gap-2 focus:outline-none cursor-pointer"
              aria-label="ASK Dairy Management"
            >
              <div className="hidden sm:block">
                <AskLogo variant="horizontal" size="xs" showTagline={false} />
              </div>
              <div className="sm:hidden">
                <AskLogo variant="mark" size="xs" />
              </div>
            </a>

            {/* Farm Branch Dropdown */}
            <div className="relative" ref={branchMenuRef}>
              <button
                onClick={() => setBranchMenuOpen(!branchMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100/90 hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
                title="Select Active Farm Branch"
              >
                <Building2 className="w-3.5 h-3.5 text-[#14532D] shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-[150px] font-medium">
                  {activeBranch.code}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
              </button>

              {branchMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate font-semibold">{b.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{b.location}</div>
                      </div>
                      {selectedBranchId === b.id && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Breadcrumb Module Badge */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-neutral-500 border-l border-neutral-200 pl-3 py-0.5">
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200/60">
                {pageTitle}
              </span>
            </div>
          </div>

          {/* Center Zone: Quick Search (Ctrl+K) */}
          <div className="flex-1 max-w-sm mx-1 sm:mx-3">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-100/80 hover:bg-neutral-100 border border-neutral-200/90 text-xs text-neutral-500 hover:text-neutral-800 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-700 transition-colors shrink-0" />
                <span className="truncate text-xs">
                  {lang === 'ur' ? 'تلاش کریں (مویشی، کسٹمر، بل)...' : 'Search (PK-, customers, feed)...'}
                </span>
              </div>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 bg-white border border-neutral-200 rounded shadow-2xs shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Zone: Controls, Network, Actions, Notifications, User */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Online / Offline Sync Indicator */}
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleOffline}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
                  isOffline
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
                title={isOffline ? 'Offline Mode (Click to toggle)' : 'Online Connected (Click to simulate offline)'}
              >
                {isOffline ? (
                  <WifiOff className="w-3 h-3 text-amber-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <span className="hidden md:inline font-mono">
                  {isOffline ? 'Offline' : 'Online'}
                </span>
              </button>

              {pendingSyncCount > 0 && (
                <button
                  onClick={onSync}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-mono font-bold cursor-pointer transition-colors"
                  title="Sync Pending Offline Changes"
                >
                  <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                  <span>{pendingSyncCount}</span>
                </button>
              )}
            </div>

            {/* Quick Action Button */}
            <button
              onClick={onOpenQuickAction}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#14532D] hover:bg-[#0f4022] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
              title="New Entry / Quick Action"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Action</span>
            </button>

            {/* Notification Center Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              title="Notification Center"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => onToggleLang(lang === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 text-[11px] font-bold text-neutral-700 transition-colors cursor-pointer border border-neutral-200"
              title="Toggle English / اردو"
            >
              <Globe className="w-3 h-3 text-neutral-500" />
              <span className="font-mono">{lang === 'en' ? 'UR' : 'EN'}</span>
            </button>

            {/* User Profile & Role Switcher */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer border border-transparent hover:border-neutral-200"
                title="User Profile & Role"
              >
                <div className="w-7 h-7 rounded-md bg-[#14532D] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {currentRole === 'super_admin' ? 'SA' : currentRole.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs leading-none">
                  <div className="font-bold text-neutral-900">
                    {lang === 'ur' ? 'سلمان سلیم' : 'M Salman Saleem'}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                    {lang === 'ur' ? roleDisplayNames[currentRole].ur : roleDisplayNames[currentRole].en}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-400 hidden lg:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2.5 border-b border-neutral-100">
                    <div className="font-bold text-neutral-900 text-xs">M Salman Saleem</div>
                    <div className="text-[11px] text-neutral-500">msalmansaleem145@gmail.com</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      <span>{lang === 'ur' ? roleDisplayNames[currentRole].ur : roleDisplayNames[currentRole].en}</span>
                    </div>
                  </div>

                  {/* Switch Role Inside Menu */}
                  <div className="py-1.5 px-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 block mb-1">
                      {lang === 'ur' ? 'کردار منتخب کریں' : 'Switch Active Role'}
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
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
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
