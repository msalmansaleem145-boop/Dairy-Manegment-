import React from 'react';
import { AskLogo } from './AskLogo';
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
  Receipt,
  X,
  CreditCard,
  Layers,
  ChevronRight
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

interface NavSection {
  title: { en: string; ur: string };
  items: {
    id: string;
    label: { en: string; ur: string };
    icon: React.ComponentType<{ className?: string }>;
    allowedRoles: UserRole[];
    badge?: string;
    badgeColor?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: { en: 'LIVESTOCK & MILK', ur: 'مویشی اور دودھ' },
    items: [
      {
        id: 'dashboard',
        label: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
        icon: LayoutDashboard,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'accountant', 'milk_operator', 'pos_operator', 'veterinarian', 'inventory_manager']
      },
      {
        id: 'animals',
        label: { en: 'Animal Management', ur: 'جانوروں کا انتظام' },
        icon: ShieldCheck,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'milk_operator', 'veterinarian'],
        badge: '14 Head'
      },
      {
        id: 'milkProduction',
        label: { en: 'Milk Collection', ur: 'دودھ کا اندراج' },
        icon: Milk,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'milk_operator'],
        badge: 'Shift'
      },
      {
        id: 'reconciliation',
        label: { en: 'Milk Reports & Chiller', ur: 'چیلر اور ریکونسیلیشن' },
        icon: Scale,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'milk_operator', 'accountant']
      }
    ]
  },
  {
    title: { en: 'COMMERCE & POS', ur: 'سیلز اور کسٹمرز' },
    items: [
      {
        id: 'posBilling',
        label: { en: 'Point of Sale (POS)', ur: 'پی او ایس بلنگ' },
        icon: ShoppingBag,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'pos_operator', 'accountant'],
        badge: 'Active',
        badgeColor: 'bg-emerald-100 text-emerald-800'
      },
      {
        id: 'customers',
        label: { en: 'Customers & Credit Ledger', ur: 'کسٹمر کھاتہ اور ادھار' },
        icon: Users,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'pos_operator', 'accountant']
      },
      {
        id: 'inventoryFeed',
        label: { en: 'Inventory & Stock', ur: 'اسٹاک اور فیڈ ونڈا' },
        icon: Package,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'inventory_manager', 'veterinarian']
      },
      {
        id: 'processing',
        label: { en: 'Dairy Value Addition', ur: 'دیسی گھی و کھویا' },
        icon: FlaskConical,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'inventory_manager']
      }
    ]
  },
  {
    title: { en: 'HEALTH & ACCOUNTING', ur: 'صحت اور مالیات' },
    items: [
      {
        id: 'vetBreeding',
        label: { en: 'Veterinary & Breeding', ur: 'ڈاکٹری معائنہ و افزائش' },
        icon: HeartPulse,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'veterinarian']
      },
      {
        id: 'accounting',
        label: { en: 'Purchases, Expenses & P&L', ur: 'کھاتہ جات اور اخراجات' },
        icon: BookOpen,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'accountant']
      },
      {
        id: 'employees',
        label: { en: 'Employees & Payroll', ur: 'ملازمین اور تنخواہیں' },
        icon: UserCheck,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'accountant']
      },
      {
        id: 'reports',
        label: { en: 'Reports & Analytics', ur: 'رپورٹس اور تجزیات' },
        icon: BarChart3,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager', 'accountant', 'pos_operator']
      },
      {
        id: 'settings',
        label: { en: 'Settings', ur: 'ترتیبات' },
        icon: Settings,
        allowedRoles: ['super_admin', 'farm_owner', 'farm_manager']
      }
    ]
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
  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200/80 w-64 sm:w-72 select-none">
      
      {/* Mobile Drawer Header */}
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between lg:hidden bg-[#14532D]/5">
        <AskLogo variant="horizontal" size="xs" />
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {navSections.map((section, sIdx) => {
          const visibleItems = section.items.filter(item => item.allowedRoles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              {/* Section Header */}
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                {lang === 'ur' ? section.title.ur : section.title.en}
              </div>

              {/* Section Items */}
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all text-left cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50/60 text-emerald-950 border border-emerald-200/80 shadow-2xs font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-emerald-600 text-white shadow-2xs' 
                          : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-800'
                      }`}>
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                      </div>
                      <span className="truncate">
                        {lang === 'ur' ? item.label.ur : item.label.en}
                      </span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                        item.badgeColor || (isActive ? 'bg-emerald-200/70 text-emerald-900' : 'bg-neutral-100 text-neutral-500')
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-3.5 border-t border-neutral-100 text-[11px] bg-neutral-50/60">
        <div className="flex items-center justify-between text-neutral-500 font-mono">
          <span className="font-semibold text-neutral-700">ASK ERP v2.4</span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            PKR (₨)
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
