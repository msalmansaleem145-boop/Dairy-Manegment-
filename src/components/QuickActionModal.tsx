import React from 'react';
import { X, Milk, ShoppingBag, ShieldCheck, BookOpen, FlaskConical, Package } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      tab: 'milkProduction',
      title: 'Morning / Evening Milk Entry',
      description: 'Record shift milk yields with fat & SNF testing',
      icon: Milk,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      tab: 'posBilling',
      title: 'Open POS Sales Terminal',
      description: 'Quick billing for milk, ghee, yogurt, and lassi',
      icon: ShoppingBag,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      tab: 'animals',
      title: 'Register New Animal',
      description: 'Add cow/buffalo ear tag, pedigree & purchase cost',
      icon: ShieldCheck,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      tab: 'processing',
      title: 'Start Dairy Processing Batch',
      description: 'Log milk conversion to Desi Ghee, Khoya or Paneer',
      icon: FlaskConical,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      tab: 'inventoryFeed',
      title: 'Log Daily Feed Consumption',
      description: 'Record Wanda and silage consumption per herd',
      icon: Package,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      tab: 'accounting',
      title: 'Post Journal Voucher',
      description: 'Record double-entry expense, purchase or payment',
      icon: BookOpen,
      color: 'text-slate-600 bg-slate-50'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Farm Quick Operations</h2>
            <p className="text-xs text-neutral-500">Select an action to launch directly</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.tab}
                onClick={() => {
                  onSelectAction(act.tab);
                  onClose();
                }}
                className="flex items-start gap-3 p-3.5 rounded-lg border border-neutral-200 hover:border-emerald-600 hover:bg-emerald-50/20 text-left transition-all cursor-pointer group"
              >
                <div className={`p-2 rounded-lg ${act.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neutral-900 group-hover:text-emerald-800">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    {act.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
