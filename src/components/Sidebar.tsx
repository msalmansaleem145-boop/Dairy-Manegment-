import React from 'react';
import {
  LayoutDashboard,
  Milk,
  Scale,
  ShoppingBag,
  Users,
  FlaskConical,
  Package,
  HeartPulse,
  BookOpen,
  UserCheck,
  BarChart3,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';
import { UserRole } from '../types';
import { Language, translations } from '../i18n/translations';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  lang: Language;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  labelKey: keyof typeof translations.en;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    labelKey: 'dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'accountant', 'milk_operator', 'pos_operator', 'veterinarian', 'inventory_manager']
  },
  {
    id: 'animals',
    labelKey: 'animals',
    icon: ShieldCheck,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'milk_operator', 'veterinarian']
  },
  {
    id: 'milkProduction',
    labelKey: 'milkProduction',
    icon: Milk,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'milk_operator']
  },
  {
    id: 'reconciliation',
    labelKey: 'reconciliation',
    icon: Scale,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'milk_operator', 'accountant']
  },
  {
    id: 'posBilling',
    labelKey: 'posBilling',
    icon: ShoppingBag,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'pos_operator', 'accountant']
  },
  {
    id: 'customers',
    labelKey: 'customers',
    icon: Users,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'pos_operator', 'accountant']
  },
  {
    id: 'processing',
    labelKey: 'processing',
    icon: FlaskConical,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'inventory_manager']
  },
  {
    id: 'inventoryFeed',
    labelKey: 'inventoryFeed',
    icon: Package,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'inventory_manager', 'veterinarian']
  },
  {
    id: 'vetBreeding',
    labelKey: 'vetBreeding',
    icon: HeartPulse,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'veterinarian']
  },
  {
    id: 'accounting',
    labelKey: 'accounting',
    icon: BookOpen,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'accountant']
  },
  {
    id: 'employees',
    labelKey: 'employees',
    icon: UserCheck,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'accountant']
  },
  {
    id: 'reports',
    labelKey: 'reports',
    icon: BarChart3,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'accountant', 'pos_operator']
  },
  {
    id: 'settings',
    labelKey: 'settings',
    icon: Settings,
    allowedRoles: ['super_admin', 'farm_owner', 'farm_manager']
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  lang,
  mobileOpen,
  onCloseMobile
}) => {
  const t = translations[lang];

  const visibleItems = navItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200 w-64 select-none">
      {/* Brand title inside drawer for mobile */}
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between lg:hidden">
        <span className="font-bold text-neutral-900 text-sm tracking-tight">ASK Dairy Management</span>
        <button
          onClick={onCloseMobile}
          className="p-1 text-neutral-500 hover:text-neutral-800 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          {lang === 'ur' ? 'ماڈیولز' : 'Modules'}
        </div>
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/60'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-neutral-500'}`} />
              <span className="truncate">{t[item.labelKey] as string}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-neutral-100 text-[11px] text-neutral-400">
        <div className="flex items-center justify-between">
          <span>ASK ERP v2.4</span>
          <span className="text-emerald-700 font-semibold">PKR (₨)</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-900/60 transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
