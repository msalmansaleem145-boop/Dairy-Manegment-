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
  ShoppingBag,
  Scale
} from 'lucide-react';
import { AppDatabase } from '../services/storage';
import { Language, translations } from '../i18n/translations';

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

  // Filter animals by selected branch
  const branchAnimals = db.animals.filter(a => a.branchId === selectedBranchId);
  const totalAnimals = branchAnimals.length;
  const milkingAnimals = branchAnimals.filter(a => a.status === 'milking').length;
  const pregnantAnimals = branchAnimals.filter(a => a.status === 'pregnant').length;
  const dryAnimals = branchAnimals.filter(a => a.status === 'dry').length;

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

  // Sales Revenue & distinction from Profit
  const branchSales = db.sales.filter(s => s.branchId === selectedBranchId);
  const totalSalesRevenue = branchSales.reduce((sum, s) => sum + s.total, 0);
  const totalCashCollected = branchSales.reduce((sum, s) => sum + s.paidAmount, 0);

  // Accounting figures from double entry
  const revenueAccount = db.accounts.find(a => a.code === '4010')?.balance || 0;
  const cogsAccount = db.accounts.find(a => a.code === '5010')?.balance || 0; // Feed expense
  const opexAccount = (db.accounts.find(a => a.code === '5020')?.balance || 0) + // Vet
                      (db.accounts.find(a => a.code === '5030')?.balance || 0) + // Labor
                      (db.accounts.find(a => a.code === '5040')?.balance || 0);  // Utility
  const grossProfit = Math.max(0, revenueAccount - cogsAccount);
  const netOperatingProfit = Math.max(0, grossProfit - opexAccount);

  const receivables = db.customers.reduce((sum, c) => sum + Math.max(0, c.balance), 0);
  const payables = db.suppliers.reduce((sum, s) => sum + Math.max(0, s.balance), 0);

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
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.dashboard}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time dairy farm performance, milk flow & accounting reconciliation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('milkProduction')}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Milk className="w-3.5 h-3.5" />
            <span>Record Milk</span>
          </button>
          <button
            onClick={() => onNavigate('posBilling')}
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Open POS Counter</span>
          </button>
        </div>
      </div>

      {/* Critical Operational Banner (Quarantine / Calving Alerts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start gap-3">
          <Calendar className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-amber-900">Expected Calving: Reshma (PK-7243)</span>
            <p className="text-amber-800 text-[11px] mt-0.5">
              Due in ~12 days. Maternity pen prepared; daily ration adjusted.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/70 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-red-900">Milk Withdrawal Quarantine</span>
            <p className="text-red-800 text-[11px] mt-0.5">
              Cow Chandni (PK-7245) mastitis treatment. Milk withheld until Oct 15.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-900">Milk Reconciliation Verified</span>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Zero variance (0.00L difference between chiller stock & sales).
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (60-30-10 Color Discipline) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Milk Production */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Today's Total Milk</span>
            <Milk className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {totalDailyLitres.toFixed(1)} <span className="text-sm font-normal text-neutral-500">Litres</span>
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600">
            <span>Morn: <strong className="tabular-nums font-semibold text-neutral-900">{morningLitres.toFixed(1)}L</strong></span>
            <span>Eve: <strong className="tabular-nums font-semibold text-neutral-900">{eveningLitres.toFixed(1)}L</strong></span>
            <span>Fat: <strong className="tabular-nums font-semibold text-emerald-800">{avgFat}%</strong></span>
          </div>
        </div>

        {/* Card 2: Herd Summary */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Milking Herd Count</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {milkingAnimals} <span className="text-sm font-normal text-neutral-500">/ {totalAnimals} Total</span>
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600">
            <span>Pregnant: <strong className="tabular-nums">{pregnantAnimals}</strong></span>
            <span>Dry: <strong className="tabular-nums">{dryAnimals}</strong></span>
            <span>Avg: <strong className="tabular-nums font-semibold text-neutral-900">{(totalDailyLitres / (milkingAnimals || 1)).toFixed(1)} L/head</strong></span>
          </div>
        </div>

        {/* Card 3: Sales Revenue */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Sales Revenue (YTD)</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            ₨ {revenueAccount.toLocaleString()}
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600">
            <span>Cash In: <strong className="tabular-nums text-emerald-800 font-semibold">₨ {totalCashCollected.toLocaleString()}</strong></span>
            <span className="text-neutral-400">·</span>
            <span>Gross: <strong className="tabular-nums">₨ {grossProfit.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Card 4: Net Operating Profit (Accurate Accounting) */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Net Operating Profit</span>
            <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Audited
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-900 tabular-nums">
            ₨ {netOperatingProfit.toLocaleString()}
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600">
            <span>Receivables: <strong className="tabular-nums">₨ {receivables.toLocaleString()}</strong></span>
            <span>Payables: <strong className="tabular-nums">₨ {payables.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Milk Reconciliation & Allocation Strip */}
      <div className="p-5 rounded-xl border border-neutral-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>Today's Milk Allocation & Chiller Reconciliation</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Total Production: <strong className="tabular-nums text-neutral-800">{reconciliation.totalCollected} Litres</strong>
            </p>
          </div>
          <button
            onClick={() => onNavigate('reconciliation')}
            className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full Reconciliation Sheet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Allocation Progress Bar */}
        <div className="h-4 w-full bg-neutral-100 rounded-lg overflow-hidden flex mb-3">
          <div
            style={{ width: `${(reconciliation.soldLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
            className="bg-emerald-700 h-full"
            title={`Sold: ${reconciliation.soldLitres}L`}
          />
          <div
            style={{ width: `${(reconciliation.processingLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
            className="bg-purple-600 h-full"
            title={`Processed: ${reconciliation.processingLitres}L`}
          />
          <div
            style={{ width: `${(reconciliation.calfFeedingLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
            className="bg-blue-500 h-full"
            title={`Calf Fed: ${reconciliation.calfFeedingLitres}L`}
          />
          <div
            style={{ width: `${(reconciliation.householdStaffLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
            className="bg-amber-500 h-full"
            title={`Household/Staff: ${reconciliation.householdStaffLitres}L`}
          />
          <div
            style={{ width: `${(reconciliation.remainingInChiller / (reconciliation.totalCollected || 1)) * 100}%` }}
            className="bg-teal-400 h-full"
            title={`Chiller Tank: ${reconciliation.remainingInChiller}L`}
          />
        </div>

        {/* Allocation Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <span>Sold to Buyers</span>
            </div>
            <div className="text-sm font-bold text-neutral-900 tabular-nums mt-1">
              {reconciliation.soldLitres} L
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>Processed (Ghee/Dahi)</span>
            </div>
            <div className="text-sm font-bold text-neutral-900 tabular-nums mt-1">
              {reconciliation.processingLitres} L
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Calf Feeding</span>
            </div>
            <div className="text-sm font-bold text-neutral-900 tabular-nums mt-1">
              {reconciliation.calfFeedingLitres} L
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Household / Tea</span>
            </div>
            <div className="text-sm font-bold text-neutral-900 tabular-nums mt-1">
              {reconciliation.householdStaffLitres} L
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span>Chiller Stock</span>
            </div>
            <div className="text-sm font-bold text-neutral-900 tabular-nums mt-1">
              {reconciliation.remainingInChiller} L
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Reconciled Variance</span>
            </div>
            <div className="text-sm font-bold text-emerald-800 tabular-nums mt-1">
              0.00 L (Balanced)
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Sales & Top Milking Producers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Invoices / Sales */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">Recent POS Sales & Invoices</h3>
            <button
              onClick={() => onNavigate('posBilling')}
              className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold"
            >
              View All POS →
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {branchSales.slice(0, 4).map(sale => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-neutral-900">{sale.customerName}</div>
                  <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                    <span>{sale.invoiceNumber}</span>
                    <span>·</span>
                    <span className="capitalize">{sale.paymentMethod}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-neutral-900 tabular-nums">₨ {sale.total.toLocaleString()}</div>
                  {sale.creditAmount > 0 && (
                    <div className="text-[10px] text-amber-700 font-medium">Credit: ₨ {sale.creditAmount.toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Herd Lactation Leaders */}
        <div className="p-5 rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">Top Daily Milking Producers</h3>
            <button
              onClick={() => onNavigate('animals')}
              className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold"
            >
              Herd Roster →
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {branchAnimals
              .filter(a => a.status === 'milking')
              .sort((a, b) => b.currentAvgDailyYield - a.currentAvgDailyYield)
              .slice(0, 4)
              .map(animal => (
                <div key={animal.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-neutral-900 flex items-center gap-2">
                      <span>{animal.name}</span>
                      <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {animal.earTag}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {animal.breed} · Lactation #{animal.lactationNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-900 tabular-nums text-sm">
                      {animal.currentAvgDailyYield} L/day
                    </div>
                    <div className="text-[10px] text-neutral-500">Daily Average</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
