import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Milk, 
  ShieldCheck, 
  Users, 
  Package, 
  ShoppingBag, 
  BookOpen, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AppDatabase } from '../services/storage';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: AppDatabase;
  onNavigate: (tab: string) => void;
  selectedBranchId: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  db,
  onNavigate,
  selectedBranchId
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent can toggle
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search Results
  const matchedAnimals = trimmed
    ? db.animals.filter(
        a =>
          a.earTag.toLowerCase().includes(trimmed) ||
          a.name.toLowerCase().includes(trimmed) ||
          a.breed.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const matchedCustomers = trimmed
    ? db.customers.filter(
        c =>
          c.name.toLowerCase().includes(trimmed) ||
          c.phone.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const matchedProducts = trimmed
    ? db.products.filter(
        p =>
          p.name.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const matchedInventory = trimmed
    ? db.inventory.filter(
        i =>
          i.name.toLowerCase().includes(trimmed) ||
          i.category.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const matchedSales = trimmed
    ? db.sales.filter(
        s =>
          s.invoiceNumber.toLowerCase().includes(trimmed) ||
          s.customerName.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  const hasResults =
    matchedAnimals.length > 0 ||
    matchedCustomers.length > 0 ||
    matchedProducts.length > 0 ||
    matchedInventory.length > 0 ||
    matchedSales.length > 0;

  const quickNavLinks = [
    { label: 'Herd Registry', tab: 'animals', icon: ShieldCheck, desc: 'Manage cows, buffaloes & calves' },
    { label: 'Milk Production', tab: 'milkProduction', icon: Milk, desc: 'Log morning & evening shift milking' },
    { label: 'POS Billing Counter', tab: 'posBilling', icon: ShoppingBag, desc: 'Process fresh milk & ghee sales' },
    { label: 'Customer Ledgers', tab: 'customers', icon: Users, desc: 'Khata balances & WhatsApp receipts' },
    { label: 'Accounting & Ledgers', tab: 'accounting', icon: BookOpen, desc: 'Double-entry P&L, balance sheet' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-900/60 backdrop-blur-xs">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-200 flex items-center gap-3 bg-neutral-50/50">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ear tags (PK-7240), customers, products, feed, invoices..."
            className="w-full bg-transparent text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-neutral-400 bg-white border border-neutral-200 rounded shadow-2xs">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {trimmed && !hasResults ? (
            <div className="py-12 text-center text-neutral-500">
              <Search className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="font-semibold text-neutral-700">No records found for "{query}"</p>
              <p className="text-xs text-neutral-400 mt-1">Try searching by animal tag like "PK-", customer name, or "milk".</p>
            </div>
          ) : null}

          {/* Quick Module Suggestions if query is empty */}
          {!trimmed && (
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">
                Quick Jump to Modules
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickNavLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.tab}
                      onClick={() => {
                        onNavigate(link.tab);
                        onClose();
                      }}
                      className="p-3 rounded-xl border border-neutral-100 hover:border-emerald-200 bg-neutral-50/60 hover:bg-emerald-50/50 flex items-center justify-between text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white border border-neutral-200 group-hover:border-emerald-300 text-emerald-700 shadow-2xs shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900 group-hover:text-emerald-900">{link.label}</div>
                          <div className="text-[11px] text-neutral-500">{link.desc}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-emerald-600 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Animals Result */}
          {matchedAnimals.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Animals ({matchedAnimals.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchedAnimals.map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      onNavigate('animals');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg border border-neutral-100 hover:border-emerald-300 bg-white hover:bg-emerald-50/40 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                        {a.earTag}
                      </span>
                      <div>
                        <span className="font-semibold text-neutral-900">{a.name}</span>
                        <span className="text-neutral-400 mx-1.5">·</span>
                        <span className="text-neutral-500">{a.breed} ({a.species})</span>
                      </div>
                    </div>
                    <span className="capitalize text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                      {a.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers Result */}
          {matchedCustomers.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Customers & Khata ({matchedCustomers.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchedCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate('customers');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg border border-neutral-100 hover:border-blue-300 bg-white hover:bg-blue-50/40 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900">{c.name}</div>
                      <div className="text-[11px] text-neutral-500">{c.phone} · {c.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-neutral-900 tabular-nums">₨ {c.balance.toLocaleString()}</div>
                      <div className="text-[10px] text-neutral-400">Current Balance</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products & Inventory Result */}
          {(matchedProducts.length > 0 || matchedInventory.length > 0) && (
            <div>
              <div className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                <span>Products & Stock</span>
              </div>
              <div className="space-y-1.5">
                {matchedProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onNavigate('posBilling');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg border border-neutral-100 hover:border-purple-300 bg-white hover:bg-purple-50/40 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-neutral-900">{p.name}</span>
                      <span className="text-neutral-400 mx-1.5">·</span>
                      <span className="text-neutral-500">Retail Product</span>
                    </div>
                    <span className="font-bold text-neutral-900 tabular-nums">₨ {p.sellingPrice} / {p.unit}</span>
                  </button>
                ))}
                {matchedInventory.map(i => (
                  <button
                    key={i.id}
                    onClick={() => {
                      onNavigate('inventoryFeed');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg border border-neutral-100 hover:border-amber-300 bg-white hover:bg-amber-50/40 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-neutral-900">{i.name}</span>
                      <span className="text-neutral-400 mx-1.5">·</span>
                      <span className="text-neutral-500">{i.location}</span>
                    </div>
                    <span className="font-bold text-amber-900 tabular-nums">{i.currentStock} {i.unit}s</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sales / Invoices Result */}
          {matchedSales.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Invoices ({matchedSales.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchedSales.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigate('posBilling');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg border border-neutral-100 hover:border-teal-300 bg-white hover:bg-teal-50/40 flex items-center justify-between text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-mono font-semibold text-teal-900">{s.invoiceNumber}</span>
                      <span className="text-neutral-400 mx-1.5">·</span>
                      <span className="text-neutral-700">{s.customerName}</span>
                    </div>
                    <span className="font-bold text-neutral-900 tabular-nums">₨ {s.total.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer info in Modal */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Search live across 14+ animals, customer khata, and dairy inventory</span>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-neutral-600 hover:text-neutral-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
