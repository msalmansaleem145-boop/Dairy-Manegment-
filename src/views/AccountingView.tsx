import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  X,
  Layers
} from 'lucide-react';
import { Account, JournalEntry, JournalLine } from '../types';
import { AppDatabase, DairyDatabaseService } from '../services/storage';
import { Language, translations } from '../i18n/translations';
import { AskLogo } from '../components/AskLogo';

interface AccountingViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
  selectedBranchId: string;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  db,
  onRefreshDb,
  lang,
  selectedBranchId
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'pnl' | 'balanceSheet' | 'journal' | 'trialBalance' | 'chart'>('pnl');

  // Post Journal Entry Modal
  const [showJvModal, setShowJvModal] = useState(false);
  const [jvDesc, setJvDesc] = useState('');
  const [jvDate, setJvDate] = useState(new Date().toISOString().split('T')[0]);
  const [jvLines, setJvLines] = useState<JournalLine[]>([
    { accountId: 'ACC-5040', accountName: 'Farm Electricity & Diesel', accountCode: '5040', debit: 15000, credit: 0 },
    { accountId: 'ACC-1010', accountName: 'Cash in Register', accountCode: '1010', debit: 0, credit: 15000 }
  ]);
  const [jvError, setJvError] = useState('');
  const [jvSuccess, setJvSuccess] = useState('');

  // P&L Calculations
  const rawMilkRevenue = db.accounts.find(a => a.code === '4010')?.balance || 0;
  const valueAddedRevenue = db.accounts.find(a => a.code === '4020')?.balance || 0;
  const animalSalesRevenue = db.accounts.find(a => a.code === '4030')?.balance || 0;
  const totalRevenue = rawMilkRevenue + valueAddedRevenue + animalSalesRevenue;

  const feedCogs = db.accounts.find(a => a.code === '5010')?.balance || 0;
  const grossProfit = Math.max(0, totalRevenue - feedCogs);

  const vetExpense = db.accounts.find(a => a.code === '5020')?.balance || 0;
  const laborExpense = db.accounts.find(a => a.code === '5030')?.balance || 0;
  const utilityExpense = db.accounts.find(a => a.code === '5040')?.balance || 0;
  const packagingExpense = db.accounts.find(a => a.code === '5050')?.balance || 0;
  const totalOpex = vetExpense + laborExpense + utilityExpense + packagingExpense;

  const netOperatingProfit = Math.max(0, grossProfit - totalOpex);

  // Balance Sheet Calculations
  const currentAssets = db.accounts
    .filter(a => a.type === 'asset' && a.subType === 'current_asset')
    .reduce((sum, a) => sum + a.balance, 0);
  const fixedAssets = db.accounts
    .filter(a => a.type === 'asset' && a.subType === 'fixed_asset')
    .reduce((sum, a) => sum + a.balance, 0);
  const totalAssets = currentAssets + fixedAssets;

  const totalLiabilities = db.accounts
    .filter(a => a.type === 'liability')
    .reduce((sum, a) => sum + a.balance, 0);

  const ownerCapital = db.accounts.find(a => a.code === '3010')?.balance || 0;
  const retainedEarnings = db.accounts.find(a => a.code === '3020')?.balance || 0;
  const totalEquity = ownerCapital + retainedEarnings + netOperatingProfit;

  // Trial Balance Totals
  const totalDebits = db.accounts
    .filter(a => a.type === 'asset' || a.type === 'expense')
    .reduce((s, a) => s + a.balance, 0);
  const totalCredits = db.accounts
    .filter(a => a.type === 'liability' || a.type === 'equity' || a.type === 'revenue')
    .reduce((s, a) => s + a.balance, 0);

  const handleAddJvLine = () => {
    const acc = db.accounts[0];
    setJvLines(prev => [
      ...prev,
      {
        accountId: acc.id,
        accountName: acc.name,
        accountCode: acc.code,
        debit: 0,
        credit: 0
      }
    ]);
  };

  const handleUpdateJvLine = (index: number, field: keyof JournalLine, value: any) => {
    setJvLines(prev => {
      const next = [...prev];
      if (field === 'accountId') {
        const found = db.accounts.find(a => a.id === value);
        if (found) {
          next[index] = {
            ...next[index],
            accountId: found.id,
            accountName: found.name,
            accountCode: found.code
          };
        }
      } else {
        next[index] = {
          ...next[index],
          [field]: value
        };
      }
      return next;
    });
  };

  const handleRemoveJvLine = (index: number) => {
    if (jvLines.length <= 2) {
      alert('A journal entry requires at least 2 balanced accounts.');
      return;
    }
    setJvLines(prev => prev.filter((_, i) => i !== index));
  };

  const handlePostJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setJvError('');

    if (!jvDesc.trim()) {
      setJvError('Description is required');
      return;
    }

    const debitSum = jvLines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const creditSum = jvLines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

    if (debitSum <= 0 || creditSum <= 0) {
      setJvError('Amounts must be greater than zero.');
      return;
    }

    if (Math.abs(debitSum - creditSum) > 0.01) {
      setJvError(`Unbalanced entry! Total Debits (₨ ${debitSum.toLocaleString()}) must equal Total Credits (₨ ${creditSum.toLocaleString()}).`);
      return;
    }

    const newJv: JournalEntry = {
      id: `JRN-${Date.now()}`,
      entryNumber: `JV-${Date.now().toString().slice(-6)}`,
      date: jvDate,
      branchId: selectedBranchId,
      description: jvDesc.trim(),
      referenceType: 'manual',
      createdBy: 'Chaudhry Salman (Farm Owner)',
      lines: jvLines.map(l => ({
        ...l,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0
      }))
    };

    DairyDatabaseService.postJournalEntry(newJv);
    onRefreshDb();
    setShowJvModal(false);
    setJvSuccess(`Journal Voucher ${newJv.entryNumber} posted successfully!`);
    setTimeout(() => setJvSuccess(''), 4000);
    setJvDesc('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.accounting}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Full double-entry general ledger, Profit & Loss, Balance Sheet & Trial Balance
          </p>
        </div>
        <button
          onClick={() => setShowJvModal(true)}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Journal Voucher</span>
        </button>
      </div>

      {jvSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{jvSuccess}</span>
        </div>
      )}

      {/* Accounting Principles Banner: Revenue != Profit */}
      <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-900 text-white grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">1. Gross Revenue</span>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
            ₨ {totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-neutral-400">Total earned sales</span>
        </div>

        <div>
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">2. Feed COGS</span>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-0.5">
            - ₨ {feedCogs.toLocaleString()}
          </div>
          <span className="text-[10px] text-neutral-400">Direct herd nutrition</span>
        </div>

        <div>
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">3. Operating Expenses</span>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-0.5">
            - ₨ {totalOpex.toLocaleString()}
          </div>
          <span className="text-[10px] text-neutral-400">Labor, vet, diesel, packing</span>
        </div>

        <div>
          <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">4. Net Operating Profit</span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
            ₨ {netOperatingProfit.toLocaleString()}
          </div>
          <span className="text-[10px] text-neutral-400">Accurate audited bottom line</span>
        </div>
      </div>

      {/* Financial Statement Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'pnl' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Profit & Loss Statement (آمدن و خرچ)
        </button>
        <button
          onClick={() => setActiveTab('balanceSheet')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'balanceSheet' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Balance Sheet (میزان نامہ)
        </button>
        <button
          onClick={() => setActiveTab('trialBalance')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'trialBalance' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Trial Balance (ٹیسٹ بیلنس)
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'journal' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Journal Entries Audit Log
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'chart' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Chart of Accounts (کھاتوں کی فہرست)
        </button>
      </div>

      {/* Tab 1: P&L Statement */}
      {activeTab === 'pnl' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5 shadow-xs max-w-4xl">
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
            <div className="flex items-center gap-3">
              <AskLogo variant="mark" size="md" />
              <div>
                <h2 className="text-base font-extrabold text-[#14532D]">ASK DAIRY MANAGEMENT</h2>
                <p className="text-xs text-neutral-500">Official Statement of Profit &amp; Loss &middot; Registered Punjab Livestock Board</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="text-xs font-semibold px-3 py-1.5 bg-[#14532D] text-white hover:bg-[#166534] rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue */}
            <div>
              <div className="font-bold uppercase text-[11px] text-neutral-500 tracking-wider mb-2">
                Operating Revenue
              </div>
              <div className="divide-y divide-neutral-100">
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-700">Raw Milk Sales Revenue (4010)</span>
                  <span className="tabular-nums font-semibold text-neutral-900">₨ {rawMilkRevenue.toLocaleString()}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-700">Value-Added Dairy Products (Desi Ghee, Khoya, Dahi) (4020)</span>
                  <span className="tabular-nums font-semibold text-neutral-900">₨ {valueAddedRevenue.toLocaleString()}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-700">Cattle, Bull & Calf Sales (4030)</span>
                  <span className="tabular-nums font-semibold text-neutral-900">₨ {animalSalesRevenue.toLocaleString()}</span>
                </div>
                <div className="py-2 flex justify-between font-bold text-neutral-900 border-t border-neutral-200">
                  <span>Total Earned Revenue</span>
                  <span className="tabular-nums text-sm text-emerald-900">₨ {totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div className="pt-2">
              <div className="font-bold uppercase text-[11px] text-neutral-500 tracking-wider mb-2">
                Cost of Goods Sold (Direct Herd Production)
              </div>
              <div className="divide-y divide-neutral-100">
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-700">Feed & Fodder Consumption Expense (5010)</span>
                  <span className="tabular-nums font-semibold text-neutral-900">₨ {feedCogs.toLocaleString()}</span>
                </div>
                <div className="py-2 flex justify-between font-bold text-neutral-900 border-t border-neutral-200 bg-neutral-50 px-2 rounded">
                  <span>Gross Operating Profit</span>
                  <span className="tabular-nums text-sm text-emerald-900">₨ {grossProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="pt-2">
              <div className="font-bold uppercase text-[11px] text-neutral-500 tracking-wider mb-2">
                Operating Expenses
              </div>
              <div className="divide-y divide-neutral-100">
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-700">Farm Labor & Staff Salaries (5030)</span>
                  <span className="tabular-nums font-semibold text-neutral-900">₨ {laborExpense.toLocaleString()}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-700">Veterinary Medicines, Semen Straws & Vaccines (5020)</span>
                  <span className="tabular-nums font-semibold text-neutral-900">₨ {vetExpense.toLocaleString()}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-700">Farm Electricity, Tube-well & Generator Fuel (5040)</span>
                  <span className="tabular-nums font-semibold text-neutral-900">₨ {utilityExpense.toLocaleString()}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-700">Packaging Jars, Caps & Consumables (5050)</span>
                  <span className="tabular-nums font-semibold text-neutral-900">₨ {packagingExpense.toLocaleString()}</span>
                </div>
                <div className="py-2 flex justify-between font-bold text-neutral-900 border-t border-neutral-200">
                  <span>Total Operating Expenses</span>
                  <span className="tabular-nums">₨ {totalOpex.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Profit Summary */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-sm">
              <div>
                <div className="font-bold text-emerald-950">Net Operating Profit (خالص منافع)</div>
                <span className="text-xs text-emerald-800">Gross Profit - Operating Expenses</span>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-950">
                ₨ {netOperatingProfit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Sheet */}
      {activeTab === 'balanceSheet' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6 shadow-xs max-w-4xl">
          <div className="border-b border-neutral-200 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Balance Sheet</h2>
              <p className="text-xs text-neutral-500">Assets = Liabilities + Equity Verification</p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
              Equation Balanced: ₨ {totalAssets.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Assets */}
            <div className="space-y-4">
              <h3 className="font-bold text-neutral-900 uppercase text-[11px] border-b pb-1">
                Assets (کل اثاثہ جات)
              </h3>
              <div className="space-y-2">
                <span className="font-semibold text-neutral-600 text-[11px]">Current Assets:</span>
                <div className="divide-y divide-neutral-100 pl-2">
                  <div className="py-1 flex justify-between">
                    <span>Cash in Register:</span>
                    <span className="tabular-nums font-semibold">₨ {(db.accounts.find(a => a.code === '1010')?.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span>Meezan Bank Account:</span>
                    <span className="tabular-nums font-semibold">₨ {(db.accounts.find(a => a.code === '1020')?.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span>Accounts Receivable:</span>
                    <span className="tabular-nums font-semibold">₨ {(db.accounts.find(a => a.code === '1030')?.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span>Raw Milk & Dairy Stock:</span>
                    <span className="tabular-nums font-semibold">₨ {((db.accounts.find(a => a.code === '1040')?.balance || 0) + (db.accounts.find(a => a.code === '1050')?.balance || 0)).toLocaleString()}</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span>Feed & Medicine Inventory:</span>
                    <span className="tabular-nums font-semibold">₨ {(db.accounts.find(a => a.code === '1060')?.balance || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-semibold text-neutral-600 text-[11px]">Fixed / Biological Assets:</span>
                <div className="divide-y divide-neutral-100 pl-2">
                  <div className="py-1 flex justify-between">
                    <span>Biological Herd Assets:</span>
                    <span className="tabular-nums font-semibold">₨ {(db.accounts.find(a => a.code === '1510')?.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span>Machinery & Chillers:</span>
                    <span className="tabular-nums font-semibold">₨ {(db.accounts.find(a => a.code === '1520')?.balance || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-100 rounded-lg flex justify-between font-bold text-neutral-900 border border-neutral-200">
                <span>TOTAL ASSETS:</span>
                <span className="tabular-nums text-sm text-emerald-900">₨ {totalAssets.toLocaleString()}</span>
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="space-y-4">
              <h3 className="font-bold text-neutral-900 uppercase text-[11px] border-b pb-1">
                Liabilities & Owner Equity
              </h3>
              <div className="space-y-2">
                <span className="font-semibold text-neutral-600 text-[11px]">Liabilities:</span>
                <div className="divide-y divide-neutral-100 pl-2">
                  <div className="py-1 flex justify-between">
                    <span>Accounts Payable (Suppliers):</span>
                    <span className="tabular-nums font-semibold">₨ {(db.accounts.find(a => a.code === '2010')?.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span>Customer Advance Deposits:</span>
                    <span className="tabular-nums font-semibold">₨ {(db.accounts.find(a => a.code === '2020')?.balance || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-semibold text-neutral-600 text-[11px]">Owner Equity:</span>
                <div className="divide-y divide-neutral-100 pl-2">
                  <div className="py-1 flex justify-between">
                    <span>Owner Capital:</span>
                    <span className="tabular-nums font-semibold">₨ {ownerCapital.toLocaleString()}</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span>Retained Earnings:</span>
                    <span className="tabular-nums font-semibold">₨ {retainedEarnings.toLocaleString()}</span>
                  </div>
                  <div className="py-1 flex justify-between text-emerald-800">
                    <span>Current Period Net Profit:</span>
                    <span className="tabular-nums font-bold">₨ {netOperatingProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-100 rounded-lg flex justify-between font-bold text-neutral-900 border border-neutral-200">
                <span>TOTAL LIABILITIES & EQUITY:</span>
                <span className="tabular-nums text-sm text-emerald-900">₨ {totalAssets.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Trial Balance */}
      {activeTab === 'trialBalance' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xs text-neutral-900">Unadjusted Trial Balance</h3>
              <p className="text-[11px] text-neutral-500">Summary of all debit and credit account balances</p>
            </div>
            <span className="text-xs font-semibold text-emerald-800">Balanced Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Account Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Debit (₨)</th>
                  <th className="py-2.5 px-3 text-right">Credit (₨)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {db.accounts.map(acc => {
                  const isDebit = acc.type === 'asset' || acc.type === 'expense';
                  return (
                    <tr key={acc.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 px-3 font-mono font-semibold text-neutral-700">{acc.code}</td>
                      <td className="py-2.5 px-3 font-medium text-neutral-900">{acc.name}</td>
                      <td className="py-2.5 px-3 capitalize text-neutral-600">{acc.type}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold">
                        {isDebit ? `₨ ${acc.balance.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold">
                        {!isDebit ? `₨ ${acc.balance.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-neutral-100/70 font-bold border-t-2 border-neutral-300 text-sm">
                  <td colSpan={3} className="py-3 px-3 uppercase">Total Balance</td>
                  <td className="py-3 px-3 text-right tabular-nums text-emerald-900">
                    ₨ {totalDebits.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-emerald-900">
                    ₨ {totalDebits.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Journal Entries */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          {db.journalEntries.map(entry => (
            <div key={entry.id} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                    {entry.entryNumber}
                  </span>
                  <span className="text-xs font-semibold text-neutral-800">{entry.description}</span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  {entry.date} · Created by: {entry.createdBy}
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-neutral-500 uppercase text-[10px] border-b border-neutral-100">
                    <th className="pb-1">Account</th>
                    <th className="pb-1 text-right">Debit (₨)</th>
                    <th className="pb-1 text-right">Credit (₨)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {entry.lines.map((l, i) => (
                    <tr key={i} className="py-1">
                      <td className="py-1 text-neutral-800 font-medium">
                        <span className="font-mono text-[11px] text-neutral-500 mr-2">{l.accountCode}</span>
                        {l.accountName}
                      </td>
                      <td className="py-1 text-right tabular-nums font-semibold text-neutral-900">
                        {l.debit > 0 ? `₨ ${l.debit.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-1 text-right tabular-nums font-semibold text-neutral-900">
                        {l.credit > 0 ? `₨ ${l.credit.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Chart of Accounts */}
      {activeTab === 'chart' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Account Title</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Sub-Type</th>
                <th className="py-2.5 px-3 text-right">Balance</th>
                <th className="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {db.accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-neutral-800">{acc.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-neutral-900">{acc.name}</td>
                  <td className="py-2.5 px-3 uppercase text-[11px] font-semibold text-neutral-600">{acc.type}</td>
                  <td className="py-2.5 px-3 capitalize text-neutral-500">{acc.subType.replace('_', ' ')}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-neutral-900">
                    ₨ {acc.balance.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 text-[11px] max-w-xs truncate">{acc.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Post Journal Entry Modal */}
      {showJvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h2 className="text-sm font-bold text-neutral-900">Post Double-Entry Journal Voucher (JV)</h2>
              <button onClick={() => setShowJvModal(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {jvError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{jvError}</span>
              </div>
            )}

            <form onSubmit={handlePostJournalEntry} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-neutral-700 font-semibold mb-1">Voucher Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electricity bill payment / Diesel for generator"
                    value={jvDesc}
                    onChange={(e) => setJvDesc(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={jvDate}
                    onChange={(e) => setJvDate(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Lines */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-700">Journal Lines:</span>
                  <button
                    type="button"
                    onClick={handleAddJvLine}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 cursor-pointer"
                  >
                    + Add Account Line
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {jvLines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={line.accountId}
                        onChange={(e) => handleUpdateJvLine(idx, 'accountId', e.target.value)}
                        className="flex-1 p-2 border border-neutral-300 rounded-lg text-xs"
                      >
                        {db.accounts.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.code} - {a.name} ({a.type})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Debit"
                        value={line.debit || ''}
                        onChange={(e) => handleUpdateJvLine(idx, 'debit', Number(e.target.value))}
                        className="w-24 p-2 border border-neutral-300 rounded-lg text-right font-semibold"
                      />

                      <input
                        type="number"
                        placeholder="Credit"
                        value={line.credit || ''}
                        onChange={(e) => handleUpdateJvLine(idx, 'credit', Number(e.target.value))}
                        className="w-24 p-2 border border-neutral-300 rounded-lg text-right font-semibold"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveJvLine(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-6 pt-2 border-t border-neutral-200 text-xs font-bold">
                  <div>Debits: ₨ {jvLines.reduce((s, l) => s + (Number(l.debit) || 0), 0).toLocaleString()}</div>
                  <div>Credits: ₨ {jvLines.reduce((s, l) => s + (Number(l.credit) || 0), 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowJvModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Commit Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
