import React from 'react';
import { 
  Building2, 
  UserCheck, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bell, 
  Globe, 
  Menu
} from 'lucide-react';
import { UserRole, FarmBranch } from '../types';
import { Language, translations } from '../i18n/translations';

interface WorkspaceToolbarProps {
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
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onToggleMobileSidebar: () => void;
}

const roleLabels: Record<UserRole, { en: string; ur: string }> = {
  super_admin: { en: 'Super Admin', ur: 'سپر ایڈمن' },
  farm_owner: { en: 'Farm Owner', ur: 'فارم مالک' },
  farm_manager: { en: 'Farm Manager', ur: 'فارم مینیجر' },
  accountant: { en: 'Accountant', ur: 'اکاؤنٹنٹ' },
  milk_operator: { en: 'Milk Operator', ur: 'دودھ آپریٹر' },
  pos_operator: { en: 'POS Cashier', ur: 'کیشیئر' },
  veterinarian: { en: 'Veterinarian (DVM)', ur: 'ڈاکٹر جانور' },
  inventory_manager: { en: 'Inventory Store', ur: 'اسٹور انچارج' },
};

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
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
  unreadNotificationsCount,
  onOpenNotifications,
  onToggleMobileSidebar,
}) => {
  const t = translations[lang];

  return (
    <div className="bg-neutral-900 text-neutral-200 border-b border-neutral-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Mobile Menu Toggle & Branch & Role */}
      <div className="flex items-center flex-wrap gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 text-neutral-300 hover:text-white rounded-md hover:bg-neutral-800 cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Branch Selector */}
        <div className="flex items-center gap-1.5 text-neutral-300">
          <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium text-neutral-400 hidden sm:inline">{t.branch}:</span>
          <select
            value={selectedBranchId}
            onChange={(e) => onSelectBranch(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-md px-2.5 py-1 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        {/* Role Persona Switcher */}
        <div className="flex items-center gap-1.5 text-neutral-300">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium text-neutral-400 hidden md:inline">{t.role}:</span>
          <select
            value={currentRole}
            onChange={(e) => onChangeRole(e.target.value as UserRole)}
            className="bg-neutral-800 border border-neutral-700 rounded-md px-2 py-1 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            {Object.entries(roleLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {lang === 'ur' ? label.ur : label.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Language, Offline Sync, Notifications */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Offline / Online state toggle */}
        <div className="flex items-center gap-2 bg-neutral-800/80 rounded-md px-2.5 py-1 border border-neutral-700">
          <button
            onClick={onToggleOffline}
            title="Click to simulate offline / online network mode"
            className="flex items-center gap-1.5 text-neutral-300 hover:text-white cursor-pointer"
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium">{t.offline}</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">{t.online}</span>
              </>
            )}
          </button>

          {pendingSyncCount > 0 && (
            <button
              onClick={onSync}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 border-l border-neutral-700 pl-2 cursor-pointer font-medium"
              title="Click to synchronize queued records"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{pendingSyncCount} {t.pendingSync}</span>
            </button>
          )}
        </div>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 text-neutral-300 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => onToggleLang(lang === 'en' ? 'ur' : 'en')}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium"
        >
          <Globe className="w-3.5 h-3.5 text-neutral-400" />
          <span>{lang === 'en' ? 'اردو (PK)' : 'English'}</span>
        </button>
      </div>
    </div>
  );
};
