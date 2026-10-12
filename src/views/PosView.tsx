import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CreditCard, 
  User, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';
import { Product, Customer, Sale, SaleItem, PaymentMethod, CashierShiftClosing } from '../types';
import { AppDatabase, DairyDatabaseService } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface PosViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
  selectedBranchId: string;
  onPrintSale: (sale: Sale) => void;
}

export const PosView: React.FC<PosViewProps> = ({
  db,
  onRefreshDb,
  lang,
  selectedBranchId,
  onPrintSale
}) => {
  const t = translations[lang];

  // Category filter & search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('WALK-IN');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [paidTenderAmount, setPaidTenderAmount] = useState<number>(0);
  const [splitCreditAmount, setSplitCreditAmount] = useState<number>(0);

  // Cashier Drawer Closing Modal
  const [showShiftCloseModal, setShowShiftCloseModal] = useState(false);
  const [actualDrawerCash, setActualDrawerCash] = useState<number>(45000);
  const [closingNotes, setClosingNotes] = useState('');
  const [closeSuccess, setCloseSuccess] = useState(false);

  // Filter products
  const products = db.products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameUrdu && p.nameUrdu.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const selectedCustomer = db.customers.find(c => c.id === selectedCustomerId);

  // Cart Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round((subtotal * taxPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount + taxAmount);

  // Add Product to Cart
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        );
      } else {
        // Check if customer has preferred price
        let price = product.sellingPrice;
        if (selectedCustomer?.preferredPricePerLitre && product.category === 'raw_milk') {
          price = selectedCustomer.preferredPricePerLitre;
        }

        return [
          ...prev,
          {
            productId: product.id,
            productName: lang === 'ur' && product.nameUrdu ? product.nameUrdu : product.name,
            quantity: 1,
            unit: product.unit,
            unitPrice: price,
            total: price
          }
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
    setTaxPercent(0);
  };

  // Complete Checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty. Add products to proceed.');
      return;
    }

    let paid = total;
    let credit = 0;

    if (paymentMethod === 'credit') {
      if (selectedCustomerId === 'WALK-IN') {
        alert('Credit sales require selecting a registered customer.');
        return;
      }
      paid = 0;
      credit = total;
    } else if (paymentMethod === 'split') {
      paid = paidTenderAmount;
      credit = Math.max(0, total - paid);
    }

    // Check customer credit limit
    if (credit > 0 && selectedCustomer) {
      const projectedBalance = selectedCustomer.balance + credit;
      if (projectedBalance > selectedCustomer.creditLimit) {
        if (!confirm(`Warning: This sale will exceed the customer's credit limit (Limit: ₨ ${selectedCustomer.creditLimit.toLocaleString()}, Projected: ₨ ${projectedBalance.toLocaleString()}). Proceed anyway?`)) {
          return;
        }
      }
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const sale: Sale = {
      id: `SALE-${Date.now()}`,
      invoiceNumber,
      branchId: selectedBranchId,
      customerId: selectedCustomerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Retail Buyer',
      date: new Date().toISOString().split('T')[0],
      items: cartItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paidAmount: paid,
      paymentMethod,
      creditAmount: credit,
      cashierName: 'Kamran Ali (POS Cashier)',
      status: 'completed'
    };

    DairyDatabaseService.completeSale(sale);
    onRefreshDb();
    onPrintSale(sale);
    handleClearCart();
  };

  // Cashier Drawer Closing
  const branchSales = db.sales.filter(s => s.branchId === selectedBranchId);
  const totalCashSalesToday = branchSales
    .filter(s => s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.paidAmount, 0);
  const openingCash = 10000;
  const expectedDrawer = openingCash + totalCashSalesToday;
  const drawerVariance = actualDrawerCash - expectedDrawer;

  const handleSaveShiftClosing = () => {
    const closing: CashierShiftClosing = {
      id: `CLS-${Date.now()}`,
      branchId: selectedBranchId,
      date: new Date().toISOString().split('T')[0],
      shift: 'morning',
      cashierName: 'Kamran Ali',
      openingCash,
      totalCashSales: totalCashSalesToday,
      totalCardWalletSales: 0,
      totalCreditSales: branchSales.reduce((sum, s) => sum + s.creditAmount, 0),
      cashPaidOutExpenses: 0,
      expectedDrawerCash: expectedDrawer,
      actualDrawerCashCount: actualDrawerCash,
      variance: drawerVariance,
      notes: closingNotes,
      closedAt: new Date().toLocaleString()
    };

    DairyDatabaseService.closeCashierShift(closing);
    onRefreshDb();
    setCloseSuccess(true);
    setTimeout(() => {
      setCloseSuccess(false);
      setShowShiftCloseModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.posBilling}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Rapid dairy sales counter, customer credit validation & thermal invoice printing
          </p>
        </div>
        <button
          onClick={() => setShowShiftCloseModal(true)}
          className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Shift Cashier Closing</span>
        </button>
      </div>

      {/* POS Grid & Cart (Split Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Catalog & Search (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t.searchProduct}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory('raw_milk')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'raw_milk' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Fresh Milk
              </button>
              <button
                onClick={() => setSelectedCategory('value_added')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'value_added' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Ghee & Dahi
              </button>
              <button
                onClick={() => setSelectedCategory('packaged')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedCategory === 'packaged' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Lassi & Bottled
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(product => {
              const inStock = product.stock > 0;
              return (
                <button
                  key={product.id}
                  onClick={() => inStock && handleAddToCart(product)}
                  disabled={!inStock}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-32 cursor-pointer ${
                    inStock
                      ? 'bg-white border-neutral-200 hover:border-emerald-600 hover:shadow-xs active:scale-[0.98]'
                      : 'bg-neutral-50 border-neutral-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                      <span>{product.code}</span>
                      <span className={`px-1.5 py-0.2 rounded font-sans font-medium ${
                        product.stock <= product.minStockAlert ? 'text-amber-800 bg-amber-50' : 'text-neutral-500'
                      }`}>
                        Stock: {product.stock} {product.unit}
                      </span>
                    </div>
                    <div className="font-bold text-neutral-900 text-xs leading-snug line-clamp-2">
                      {lang === 'ur' && product.nameUrdu ? product.nameUrdu : product.name}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-800 tabular-nums">
                      ₨ {product.sellingPrice}
                      <span className="text-[10px] font-normal text-neutral-500">/{product.unit}</span>
                    </span>
                    <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      +
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Cart & Payment Terminal (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-800" />
              <h2 className="font-bold text-sm text-neutral-900">Current Sale Invoice</h2>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="space-y-1 text-xs">
            <label className="text-neutral-600 font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>Customer Account:</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="WALK-IN">Walk-in Direct Buyer (نقد خریدار)</option>
              {db.customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — Bal: ₨ {c.balance.toLocaleString()} (Limit: ₨ {c.creditLimit.toLocaleString()})
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] flex justify-between">
                <span>Current Ledger Balance: <strong className="tabular-nums">₨ {selectedCustomer.balance.toLocaleString()}</strong></span>
                <span>Remaining Credit: <strong className="tabular-nums text-emerald-800">₨ {(selectedCustomer.creditLimit - selectedCustomer.balance).toLocaleString()}</strong></span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="divide-y divide-neutral-100 max-h-56 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs">
                No items added. Click products on the left to add to sale cart.
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.productId} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <div className="font-semibold text-neutral-900">{item.productName}</div>
                    <div className="text-[11px] text-neutral-500 tabular-nums">
                      ₨ {item.unitPrice} per {item.unit}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, -1)}
                      className="w-5 h-5 rounded bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, 1)}
                      className="w-5 h-5 rounded bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="w-20 text-right font-bold text-neutral-900 tabular-nums">
                    ₨ {item.total.toLocaleString()}
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="ml-2 text-neutral-300 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Totals & Discounts */}
          <div className="pt-3 border-t border-neutral-200 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span className="tabular-nums font-semibold">₨ {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Discount (₨):</span>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-20 p-1 text-right border border-neutral-300 rounded text-xs tabular-nums focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
              <span>Net Total Payable:</span>
              <span className="text-lg text-emerald-900 tabular-nums">₨ {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5 text-xs pt-1">
            <label className="font-semibold text-neutral-700">Payment Tender:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2 rounded-lg border text-center font-medium cursor-pointer ${
                  paymentMethod === 'cash' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                Cash (نقد)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_raast')}
                className={`p-2 rounded-lg border text-center font-medium cursor-pointer ${
                  paymentMethod === 'bank_raast' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                Raast / Bank
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                disabled={selectedCustomerId === 'WALK-IN'}
                className={`p-2 rounded-lg border text-center font-medium cursor-pointer ${
                  paymentMethod === 'credit' 
                    ? 'bg-amber-800 text-white border-amber-800' 
                    : selectedCustomerId === 'WALK-IN' 
                      ? 'opacity-40 cursor-not-allowed bg-neutral-50' 
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                Khata Credit
              </button>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className={`w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors ${
              cartItems.length > 0
                ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Complete & Print Receipt (₨ {total.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* Shift Closing Settlement Modal */}
      {showShiftCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-neutral-900">Shift Cashier Closing & Settlement</h2>
            
            {closeSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-center font-semibold">
                Cash drawer reconciled and shift closed successfully!
              </div>
            ) : (
              <>
                <div className="space-y-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Opening Float:</span>
                    <span className="font-semibold tabular-nums">₨ {openingCash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total Cash Sales:</span>
                    <span className="font-semibold tabular-nums">₨ {totalCashSalesToday.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-200 text-neutral-900 font-bold">
                    <span>Expected Drawer Balance:</span>
                    <span className="tabular-nums">₨ {expectedDrawer.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">
                    Actual Physical Cash Count (₨):
                  </label>
                  <input
                    type="number"
                    value={actualDrawerCash}
                    onChange={(e) => setActualDrawerCash(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-bold text-sm focus:ring-1 focus:ring-emerald-600"
                  />
                  <div className="mt-1 flex justify-between text-[11px]">
                    <span className="text-neutral-500">Drawer Discrepancy:</span>
                    <span className={`font-bold tabular-nums ${drawerVariance === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {drawerVariance === 0 ? 'Zero Variance (Perfect Match)' : `₨ ${drawerVariance.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Shift Notes:</label>
                  <input
                    type="text"
                    placeholder="e.g. Morning counter closed with zero cash variance"
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowShiftCloseModal(false)}
                    className="px-3 py-1.5 border border-neutral-300 rounded-lg text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveShiftClosing}
                    className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                  >
                    Confirm & Lock Drawer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
