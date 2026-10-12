import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  DollarSign, 
  CreditCard, 
  Share2, 
  Printer, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Customer, CustomerLedgerEntry, PaymentMethod } from '../types';
import { AppDatabase, DairyDatabaseService } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface CustomersViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  db,
  onRefreshDb,
  lang
}) => {
  const t = translations[lang];

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Selected Customer for Ledger Statement
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<Customer['category']>('wholesale');
  const [creditLimit, setCreditLimit] = useState<number>(100000);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [dailyQuota, setDailyQuota] = useState<number>(20);
  const [preferredPrice, setPreferredPrice] = useState<number>(215);

  // Record Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(10000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payRef, setPayRef] = useState('');

  const filteredCustomers = db.customers.filter(c => {
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCustomer: Customer = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      category,
      creditLimit: Number(creditLimit) || 50000,
      openingBalance: Number(openingBalance) || 0,
      balance: Number(openingBalance) || 0,
      dailyMilkQuotaLitres: Number(dailyQuota) || 0,
      preferredPricePerLitre: Number(preferredPrice) || 215
    };

    const currentDb = DairyDatabaseService.getDatabase();
    currentDb.customers.unshift(newCustomer);
    if (newCustomer.openingBalance > 0) {
      currentDb.customerLedgers.unshift({
        id: `LEDG-${Date.now()}`,
        customerId: newCustomer.id,
        date: new Date().toISOString().split('T')[0],
        type: 'opening',
        description: 'Opening Balance Forward',
        debit: newCustomer.openingBalance,
        credit: 0,
        runningBalance: newCustomer.openingBalance
      });
    }
    DairyDatabaseService.saveDatabase(currentDb);
    onRefreshDb();
    setShowAddModal(false);

    // Reset
    setName('');
    setPhone('');
    setAddress('');
  };

  const handlePostPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || payAmount <= 0) return;

    DairyDatabaseService.recordCustomerPayment(
      selectedCustomer.id,
      Number(payAmount),
      payMethod,
      payRef
    );
    onRefreshDb();
    
    // Update local selected reference
    const updated = DairyDatabaseService.getDatabase().customers.find(c => c.id === selectedCustomer.id);
    setSelectedCustomer(updated || null);
    setShowPaymentModal(false);
    setPayRef('');
  };

  const handleShareWhatsApp = (customer: Customer) => {
    const text = encodeURIComponent(
      `*ASK Dairy Management — Account Statement*\n` +
      `Customer: ${customer.name}\n` +
      `Current Balance Due: Rs. ${customer.balance.toLocaleString()}\n` +
      `Daily Milk Quota: ${customer.dailyMilkQuotaLitres || 0} Litres\n` +
      `Helpline: +92 300 4567890\n` +
      `Thank you for your business!`
    );
    window.open(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.customers}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Customer directory, daily milk quotas, credit limits & transaction khata ledgers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addCustomer}</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name, phone, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              categoryFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Accounts
          </button>
          <button
            onClick={() => setCategoryFilter('wholesale')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              categoryFilter === 'wholesale' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Wholesale / Shops
          </button>
          <button
            onClick={() => setCategoryFilter('hotel_dairy')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              categoryFilter === 'hotel_dairy' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Hotels & Restaurants
          </button>
          <button
            onClick={() => setCategoryFilter('subscription')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              categoryFilter === 'subscription' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Daily Households
          </button>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Customer Name & ID</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Contact & Address</th>
                <th className="py-3 px-3 text-right">Daily Quota (L)</th>
                <th className="py-3 px-3 text-right">Credit Limit</th>
                <th className="py-3 px-3 text-right">Current Balance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.map(customer => {
                const isOverLimit = customer.balance > customer.creditLimit;
                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{customer.name}</div>
                      <div className="text-[11px] font-mono text-neutral-400">{customer.id}</div>
                    </td>
                    <td className="py-3 px-3 capitalize text-neutral-700">
                      {customer.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-neutral-900 font-medium">{customer.phone}</div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-xs">{customer.address}</div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-semibold text-neutral-800">
                      {customer.dailyMilkQuotaLitres ? `${customer.dailyMilkQuotaLitres} L` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-neutral-600">
                      ₨ {customer.creditLimit.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <span className={`font-bold ${isOverLimit ? 'text-red-700' : 'text-neutral-900'}`}>
                        ₨ {customer.balance.toLocaleString()}
                      </span>
                      {isOverLimit && (
                        <div className="text-[10px] text-red-600 font-semibold">Over Credit Limit!</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-50 rounded"
                          title="Open Ledger Khata"
                        >
                          Ledger
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(customer)}
                          className="p-1 text-neutral-500 hover:text-emerald-700 rounded"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Ledger Statement Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <span>{selectedCustomer.name}</span>
                  <span className="text-[11px] font-mono text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">
                    {selectedCustomer.id}
                  </span>
                </h2>
                <p className="text-xs text-neutral-500">
                  {selectedCustomer.phone} · {selectedCustomer.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="p-4 bg-neutral-100/70 border-b border-neutral-200 grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
                <span className="text-neutral-500 text-[11px]">Outstanding Due (بقایا)</span>
                <div className="text-base font-bold text-neutral-900 tabular-nums">
                  ₨ {selectedCustomer.balance.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
                <span className="text-neutral-500 text-[11px]">Approved Credit Limit</span>
                <div className="text-base font-bold text-neutral-900 tabular-nums">
                  ₨ {selectedCustomer.creditLimit.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
                <span className="text-neutral-500 text-[11px]">Daily Quota & Shift</span>
                <div className="text-base font-bold text-emerald-800 tabular-nums">
                  {selectedCustomer.dailyMilkQuotaLitres || 0} Litres/day
                </div>
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-xs text-neutral-800">Khata Transaction Ledger</h3>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-1 bg-emerald-800 text-white rounded text-xs font-semibold hover:bg-emerald-900 cursor-pointer"
                >
                  + Record Payment Receipt
                </button>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-y border-neutral-200 text-neutral-600 font-semibold uppercase text-[10px]">
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Description</th>
                    <th className="py-2 px-2 text-right">Debit (Sales)</th>
                    <th className="py-2 px-2 text-right">Credit (Paid)</th>
                    <th className="py-2 px-2 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {db.customerLedgers
                    .filter(l => l.customerId === selectedCustomer.id)
                    .map(entry => (
                      <tr key={entry.id} className="hover:bg-neutral-50/50">
                        <td className="py-2 px-2 font-mono text-[11px] text-neutral-600">{entry.date}</td>
                        <td className="py-2 px-2 text-neutral-800 font-medium">
                          {entry.description}
                          {entry.referenceId && (
                            <span className="text-neutral-400 font-mono text-[10px] ml-1">({entry.referenceId})</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-neutral-900 font-semibold">
                          {entry.debit > 0 ? `₨ ${entry.debit.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-emerald-800 font-semibold">
                          {entry.credit > 0 ? `₨ ${entry.credit.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums font-bold text-neutral-900">
                          ₨ {entry.runningBalance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <button
                onClick={() => handleShareWhatsApp(selectedCustomer)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send WhatsApp Khata Statement</span>
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Receipt Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-neutral-900">
              Receive Payment from {selectedCustomer.name}
            </h3>

            <form onSubmit={handlePostPayment} className="space-y-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Amount Received (₨) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 border border-neutral-300 rounded-lg text-sm font-bold focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Payment Channel</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="cash">Cash (نقد)</option>
                  <option value="bank_raast">Bank Transfer / Raast</option>
                  <option value="easypaisa_jazzcash">EasyPaisa / JazzCash</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Bank Reference / Cheque #</label>
                <input
                  type="text"
                  placeholder="e.g. Raast Ref# 928412"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h2 className="text-sm font-bold text-neutral-900">Add New Customer Account</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Customer / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalimar Hotel / Dr. Tariq"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Account Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="wholesale">Wholesale Buyer / Milk Shop</option>
                    <option value="hotel_dairy">Hotel / Sweet Shop / Restaurant</option>
                    <option value="subscription">Daily Household Subscription</option>
                    <option value="retail">Retail Counter Buyer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="e.g. Main Katchery Chowk, Okara"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Credit Limit (₨)</label>
                  <input
                    type="number"
                    step="5000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Opening Balance (₨)</label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Daily Quota (L)</label>
                  <input
                    type="number"
                    value={dailyQuota}
                    onChange={(e) => setDailyQuota(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
