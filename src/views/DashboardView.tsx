import React from 'react';
import {
  Milk,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Scale,
  Users,
  Package,
  HeartPulse,
  BookOpen,
  AlertTriangle,
  ArrowDownRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { AppDatabase } from '../services/storage';
import { Language, translations } from '../i18n/translations';
import { DashboardAnalyticsCharts } from '../components/DashboardAnalyticsCharts';

interface DashboardViewProps {
  db: AppDatabase;
  onNavigate: (tab: string) => void;
  lang: Language;
  selectedBranchId: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  db,
  onNavigate,
  lang,
  selectedBranchId
}) => {
  const t = translations[lang];

  // Branch Animals
  const branchAnimals = db.animals.filter(a => a.branchId === selectedBranchId);
  const totalAnimals = branchAnimals.length;
  const milkingAnimals = branchAnimals.filter(a => a.status === 'milking').length;
  const pregnantAnimals = branchAnimals.filter(a => a.status === 'pregnant').length;
  const dryAnimals = branchAnimals.filter(a => a.status === 'dry').length;
  const sickAnimals = branchAnimals.filter(a => a.status === 'sick').length;

  // Today's milk
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = db.milkRecords.filter(r => r.date === today && r.branchId === selectedBranchId);
  const morningLitres = todayRecords
    .filter(r => r.shift === 'morning')
    .reduce((sum, r) => sum + r.quantityLitres, 0);
  const eveningLitres = todayRecords
    .filter(r => r.shift === 'evening')
    .reduce((sum, r) => sum + r.quantityLitres, 0);
  const totalDailyLitres = morningLitres + eveningLitres;

  // Average Fat & SNF
  const avgFat = todayRecords.length > 0 
    ? (todayRecords.reduce((sum, r) => sum + r.fatPercentage, 0) / todayRecords.length).toFixed(1)
    : '5.2';
  const avgSnf = todayRecords.length > 0
    ? (todayRecords.reduce((sum, r) => sum + r.snfPercentage, 0) / todayRecords.length).toFixed(1)
    : '8.9';

  // Sales Revenue & Cash Collections
  const branchSales = db.sales.filter(s => s.branchId === selectedBranchId);
  const totalSalesRevenue = branchSales.reduce((sum, s) => sum + s.total, 0);
  const totalCashCollected = branchSales.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalCreditSales = branchSales.reduce((sum, s) => sum + s.creditAmount, 0);

  // Accounting figures from double entry accounts
  const revenueAccount = db.accounts.find(a => a.code === '4010')?.balance || 485000;
  const feedCost = db.accounts.find(a => a.code === '5010')?.balance || 142000;
  const vetCost = db.accounts.find(a => a.code === '5020')?.balance || 28500;
  const laborCost = db.accounts.find(a => a.code === '5030')?.balance || 65000;
  const utilityCost = db.accounts.find(a => a.code === '5040')?.balance || 21500;
  const monthlyExpenses = feedCost + vetCost + laborCost + utilityCost;
  const grossProfit = Math.max(0, revenueAccount - feedCost);
  const netOperatingProfit = Math.max(0, grossProfit - (vetCost + laborCost + utilityCost));
  const profitMarginPercent = Math.round((netOperatingProfit / (revenueAccount || 1)) * 100);

  // Customer Receivables (Khata)
  const receivables = db.customers.reduce((sum, c) => sum + Math.max(0, c.balance), 0);
  const overdueCustomersCount = db.customers.filter(c => c.balance > c.creditLimit * 0.7).length;

  // Low Stock Items
  const lowStockItems = db.inventory.filter(i => i.currentStock <= i.minStockAlert * 1.5);

  // Reconciliation data
  const reconciliation = db.milkReconciliations.find(r => r.branchId === selectedBranchId) || {
    morningCollection: morningLitres,
    eveningCollection: eveningLitres,
    totalCollected: totalDailyLitres,
    soldLitres: 74,
    calfFeedingLitres: 12,
    householdStaffLitres: 6,
    processingLitres: 20,
    wastedRejectedLitres: 0,
    remainingInChiller: 4.2,
    reconciledVariance: 0,
    status: 'balanced'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
              {t.dashboard}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time livestock monitoring, shift milk yields, and automated double-entry accounting
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('milkProduction')}
            className="px-4 py-2 bg-[#14532D] hover:bg-[#0f4022] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
          >
            <Milk className="w-4 h-4 text-emerald-300" />
            <span>Record Milk Shift</span>
          </button>
          <button
            onClick={() => onNavigate('posBilling')}
            className="px-4 py-2 bg-[#0F172A] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span>Open POS Counter</span>
          </button>
          <button
            onClick={() => onNavigate('animals')}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-neutral-600" />
            <span>Herd Registry</span>
          </button>
        </div>
      </div>

      {/* 2. Operational Notice Banners (Quarantine / Calving Alerts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Calving Alert */}
        <div className="p-3.5 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-50/40 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-amber-950 flex items-center gap-1">
              <span>Expected Calving: Reshma (PK-7243)</span>
            </span>
            <p className="text-amber-800 text-[11px] mt-0.5">
              Due in ~12 days. Maternity pen sanitized; transition ration initiated.
            </p>
          </div>
        </div>

        {/* Milk Quarantine Alert */}
        <div className="p-3.5 rounded-xl border border-rose-200/80 bg-gradient-to-r from-rose-50 to-rose-50/40 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-800 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-rose-950">Milk Withdrawal Quarantine</span>
            <p className="text-rose-800 text-[11px] mt-0.5">
              Cow Chandni (PK-7245) intramammary treatment. Tank discard active until Oct 15.
            </p>
          </div>
        </div>

        {/* Chiller Stock Reconciliation */}
        <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-emerald-50/40 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-emerald-950">Milk Stock Reconciled</span>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Zero variance: Daily collected matches sales, processing & chiller storage.
            </p>
          </div>
        </div>
      </div>

      {/* 3. The 8 PRD Summary Cards Grid with Modern Colourful Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Milk Production */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-600">Today's Milk Yield</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Milk className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              {totalDailyLitres.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-neutral-500">Litres</span>
            <span className="ml-auto flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +6.4%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Morn: <strong className="text-neutral-900">{morningLitres.toFixed(1)}L</strong></span>
            <span>Eve: <strong className="text-neutral-900">{eveningLitres.toFixed(1)}L</strong></span>
            <span>Fat: <strong className="text-emerald-800 font-bold">{avgFat}%</strong></span>
          </div>
        </div>

        {/* Card 2: Today's Milk Sales */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-600">Today's Sales Revenue</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              ₨ {totalSalesRevenue.toLocaleString()}
            </span>
            <span className="ml-auto flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12.1%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Cash: <strong className="text-emerald-700 font-semibold">₨ {totalCashCollected.toLocaleString()}</strong></span>
            <span>Credit: <strong className="text-amber-700">₨ {totalCreditSales.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Card 3: Total Animals */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-600">Total Livestock Herd</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              {totalAnimals}
            </span>
            <span className="text-xs font-semibold text-neutral-500">Heads</span>
            <span className="ml-auto text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
              {milkingAnimals} in Milk
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Milking: <strong className="text-neutral-900">{milkingAnimals}</strong></span>
            <span>Dry: <strong className="text-neutral-900">{dryAnimals}</strong></span>
            <span>Yield: <strong className="text-teal-800">{(totalDailyLitres / (milkingAnimals || 1)).toFixed(1)}L/head</strong></span>
          </div>
        </div>

        {/* Card 4: Pregnant Animals */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-600">Pregnant & Due Calving</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono tracking-tight">
              {pregnantAnimals}
            </span>
            <span className="text-xs font-semibold text-neutral-500">Heads</span>
            <span className="ml-auto text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              1 Due Soon
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Breeding AI: <strong>Active</strong></span>
            <span className="text-amber-800 font-semibold">Reshma: Due 12d</span>
          </div>
        </div>

        {/* Card 5: Monthly Expenses */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-600">Monthly Operating Expenses</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              ₨ {monthlyExpenses.toLocaleString()}
            </span>
            <span className="ml-auto text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              OPEX
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Feed: <strong className="text-neutral-900">₨ {feedCost.toLocaleString()}</strong></span>
            <span>Labor/Vet: <strong className="text-neutral-900">₨ {(laborCost + vetCost).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Card 6: Net Profit/Loss */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-600">Net Operating Profit</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono tracking-tight">
              ₨ {netOperatingProfit.toLocaleString()}
            </span>
            <span className="ml-auto text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {profitMarginPercent}% Margin
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Gross: <strong className="text-neutral-900">₨ {grossProfit.toLocaleString()}</strong></span>
            <span className="text-emerald-700 font-bold">Double-Entry Audited</span>
          </div>
        </div>

        {/* Card 7: Pending Customer Payments */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-600">Pending Receivables (Khata)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono tracking-tight">
              ₨ {receivables.toLocaleString()}
            </span>
            <span className="ml-auto text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {overdueCustomersCount} Near Limit
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Active Customers: <strong>{db.customers.length}</strong></span>
            <button 
              onClick={() => onNavigate('customers')}
              className="text-amber-800 font-bold hover:underline"
            >
              Send Reminders &rarr;
            </button>
          </div>
        </div>

        {/* Card 8: Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold text-neutral-600">Inventory Stock Status</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              {lowStockItems.length}
            </span>
            <span className="text-xs font-semibold text-neutral-500">Items Low</span>
            <span className="ml-auto text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
              Action Needed
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>FMD Vaccine: <strong className="text-rose-700">3 Vials</strong></span>
            <button 
              onClick={() => onNavigate('inventoryFeed')}
              className="text-rose-700 font-bold hover:underline"
            >
              Reorder PO &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* 4. Interactive Charts and Data Visualizations Component (Daily Milk, Financials, Population, Products) */}
      <DashboardAnalyticsCharts 
        db={db}
        selectedBranchId={selectedBranchId}
      />

      {/* 5. Milk Allocation & Chiller Reconciliation Strip */}
      <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200/80 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-700" />
              <span>Today's Milk Allocation & Chiller Reconciliation</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Daily Shift Collection: <strong className="font-mono text-neutral-900">{reconciliation.totalCollected} Litres</strong>
            </p>
          </div>
          <button
            onClick={() => onNavigate('reconciliation')}
            className="text-xs text-emerald-800 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors self-start sm:self-auto"
          >
            <span>Open Full Reconciliation Sheet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Allocation Progress Bar */}
        <div className="h-4 w-full bg-neutral-100 rounded-xl overflow-hidden flex mb-4 shadow-inner">
          <div
            style={{ width: `${(reconciliation.soldLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
            className="bg-emerald-600 h-full transition-all"
            title={`Sold: ${reconciliation.soldLitres}L`}
          />
          <div
            style={{ width: `${(reconciliation.processingLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
            className="bg-purple-600 h-full transition-all"
            title={`Processed: ${reconciliation.processingLitres}L`}
          />
          <div
            style={{ width: `${(reconciliation.calfFeedingLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
            className="bg-blue-500 h-full transition-all"
            title={`Calf Fed: ${reconciliation.calfFeedingLitres}L`}
          />
          <div
            style={{ width: `${(reconciliation.householdStaffLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`Household/Staff: ${reconciliation.householdStaffLitres}L`}
          />
          <div
            style={{ width: `${(reconciliation.remainingInChiller / (reconciliation.totalCollected || 1)) * 100}%` }}
            className="bg-teal-400 h-full transition-all"
            title={`Chiller Tank: ${reconciliation.remainingInChiller}L`}
          />
        </div>

        {/* Allocation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/60">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Sold to Customers</span>
            </div>
            <div className="text-base font-bold text-neutral-900 font-mono mt-1">
              {reconciliation.soldLitres} L
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/60">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>Ghee & Dahi Batches</span>
            </div>
            <div className="text-base font-bold text-neutral-900 font-mono mt-1">
              {reconciliation.processingLitres} L
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/60">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Calf Feeding Ration</span>
            </div>
            <div className="text-base font-bold text-neutral-900 font-mono mt-1">
              {reconciliation.calfFeedingLitres} L
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/60">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Household / Staff</span>
            </div>
            <div className="text-base font-bold text-neutral-900 font-mono mt-1">
              {reconciliation.householdStaffLitres} L
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/60">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span>Bulk Chiller Stock</span>
            </div>
            <div className="text-base font-bold text-neutral-900 font-mono mt-1">
              {reconciliation.remainingInChiller} L
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Reconciled Variance</span>
            </div>
            <div className="text-base font-bold text-emerald-950 font-mono mt-1">
              0.00 L (Balanced)
            </div>
          </div>
        </div>
      </div>

      {/* 6. Two Column Tables: Recent POS Sales & Top Milking Producers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recent POS Invoices */}
        <div className="p-5 rounded-2xl border border-neutral-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-neutral-900">Recent POS Sales & Billing</h3>
            </div>
            <button
              onClick={() => onNavigate('posBilling')}
              className="text-xs text-emerald-800 hover:text-emerald-900 font-bold"
            >
              View All POS &rarr;
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {branchSales.slice(0, 4).map(sale => (
              <div key={sale.id} className="py-3 flex items-center justify-between text-xs hover:bg-neutral-50 px-2 rounded-lg transition-colors">
                <div>
                  <div className="font-semibold text-neutral-900">{sale.customerName}</div>
                  <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-neutral-600">{sale.invoiceNumber}</span>
                    <span>&middot;</span>
                    <span className="capitalize px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 font-medium">
                      {sale.paymentMethod}
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-neutral-900 text-sm">₨ {sale.total.toLocaleString()}</div>
                  {sale.creditAmount > 0 && (
                    <div className="text-[10px] text-amber-700 font-semibold">Credit: ₨ {sale.creditAmount.toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Herd Lactation Leaders */}
        <div className="p-5 rounded-2xl border border-neutral-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-neutral-900">Top Daily Milking Producers</h3>
            </div>
            <button
              onClick={() => onNavigate('animals')}
              className="text-xs text-emerald-800 hover:text-emerald-900 font-bold"
            >
              Herd Roster &rarr;
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {branchAnimals
              .filter(a => a.status === 'milking')
              .sort((a, b) => b.currentAvgDailyYield - a.currentAvgDailyYield)
              .slice(0, 4)
              .map(animal => (
                <div key={animal.id} className="py-3 flex items-center justify-between text-xs hover:bg-neutral-50 px-2 rounded-lg transition-colors">
                  <div>
                    <div className="font-semibold text-neutral-900 flex items-center gap-2">
                      <span>{animal.name}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        {animal.earTag}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {animal.breed} &middot; Lactation #{animal.lactationNumber}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-extrabold text-emerald-900 text-sm">
                      {animal.currentAvgDailyYield} L/day
                    </div>
                    <div className="text-[10px] text-neutral-400">Daily Average</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>

    </div>
  );
};
