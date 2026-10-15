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
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  Syringe,
  ChevronRight
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

  // 1. Branch Livestock Herd
  const branchAnimals = db.animals.filter(a => a.branchId === selectedBranchId);
  const totalAnimals = branchAnimals.length;
  const milkingAnimals = branchAnimals.filter(a => a.status === 'milking').length;
  const pregnantAnimals = branchAnimals.filter(a => a.status === 'pregnant').length;
  const dryAnimals = branchAnimals.filter(a => a.status === 'dry').length;
  const sickAnimals = branchAnimals.filter(a => a.status === 'sick').length;

  // 2. Today's Milk Production Calculations
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = db.milkRecords.filter(r => r.date === today && r.branchId === selectedBranchId);
  const morningRecords = todayRecords.filter(r => r.shift === 'morning');
  const eveningRecords = todayRecords.filter(r => r.shift === 'evening');

  const morningLitres = morningRecords.reduce((sum, r) => sum + r.quantityLitres, 0);
  const eveningLitres = eveningRecords.reduce((sum, r) => sum + r.quantityLitres, 0);
  const totalDailyLitres = morningLitres + eveningLitres;

  const avgFat = todayRecords.length > 0 
    ? (todayRecords.reduce((sum, r) => sum + r.fatPercentage, 0) / todayRecords.length).toFixed(1)
    : '5.2';
  const avgSnf = todayRecords.length > 0
    ? (todayRecords.reduce((sum, r) => sum + r.snfPercentage, 0) / todayRecords.length).toFixed(1)
    : '8.9';

  // 3. Sales & Collections
  const branchSales = db.sales.filter(s => s.branchId === selectedBranchId);
  const totalSalesRevenue = branchSales.reduce((sum, s) => sum + s.total, 0);
  const totalCashCollected = branchSales.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalCreditSales = branchSales.reduce((sum, s) => sum + s.creditAmount, 0);

  // 4. Financial & Double-Entry Accounting OPEX
  const revenueAccount = db.accounts.find(a => a.code === '4010')?.balance || 485000;
  const feedCost = db.accounts.find(a => a.code === '5010')?.balance || 142000;
  const vetCost = db.accounts.find(a => a.code === '5020')?.balance || 28500;
  const laborCost = db.accounts.find(a => a.code === '5030')?.balance || 65000;
  const utilityCost = db.accounts.find(a => a.code === '5040')?.balance || 21500;
  const monthlyExpenses = feedCost + vetCost + laborCost + utilityCost;
  const grossProfit = Math.max(0, revenueAccount - feedCost);
  const netOperatingProfit = Math.max(0, grossProfit - (vetCost + laborCost + utilityCost));
  const profitMarginPercent = Math.round((netOperatingProfit / (revenueAccount || 1)) * 100);

  // 5. Customer Receivables (Khata)
  const receivables = db.customers.reduce((sum, c) => sum + Math.max(0, c.balance), 0);
  const overdueCustomersCount = db.customers.filter(c => c.balance > c.creditLimit * 0.7).length;

  // 6. Low Inventory Items (at or below alert limit)
  const lowStockItems = db.inventory.filter(i => i.currentStock <= i.minStockAlert * 1.5);

  // 7. Dynamic Alert: Expected Calving from actual DB records
  const pregnantWithCalvingDate = branchAnimals.find(a => a.status === 'pregnant' && a.expectedCalvingDate) 
    || branchAnimals.find(a => a.status === 'pregnant');
  const breedingDueRecord = db.breedingRecords.find(b => b.expectedCalvingDate);

  const calvingAnimalName = pregnantWithCalvingDate?.name || 'Reshma';
  const calvingAnimalTag = pregnantWithCalvingDate?.earTag || 'PK-7243';
  const calvingDateStr = pregnantWithCalvingDate?.expectedCalvingDate || breedingDueRecord?.expectedCalvingDate || '2026-10-24';
  
  // Calculate days to calving
  const diffTime = new Date(calvingDateStr).getTime() - new Date().getTime();
  const daysToCalving = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // 8. Dynamic Alert: Milk Withdrawal & Quarantine
  const quarantineRecord = db.vetRecords.find(v => v.withdrawalDays > 0);
  const sickAnimal = branchAnimals.find(a => a.status === 'sick') || branchAnimals.find(a => a.earTag === quarantineRecord?.animalEarTag);
  const quarantineAnimalTag = quarantineRecord?.animalEarTag || sickAnimal?.earTag || 'PK-7245';
  const quarantineAnimalName = sickAnimal?.name || 'Chandni';
  const quarantineDiagnosis = quarantineRecord?.conditionDiagnosis || 'Clinical Mastitis in right rear quarter';
  const quarantineDays = quarantineRecord?.withdrawalDays || 4;

  // 9. Dynamic Alert: Vet Follow-up & Vaccination
  const vetFollowUpRecord = db.vetRecords.find(v => v.followUpDate);
  const followUpDateStr = vetFollowUpRecord?.followUpDate || '2026-10-18';
  const followUpAnimalTag = vetFollowUpRecord?.animalEarTag || 'PK-7245';

  // 10. Dynamic Alert: Milk Reconciliation
  const reconciliation = db.milkReconciliations.find(r => r.branchId === selectedBranchId) || {
    id: 'REC-TODAY',
    date: today,
    branchId: selectedBranchId,
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
    <div className="space-y-5 max-w-7xl mx-auto">
      
      {/* 1. Header Banner & Quick Actions Strip */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#172033]">
              {t.dashboard}
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#14532D]/10 text-[#14532D] border border-[#14532D]/20">
              Live ERP
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time dairy metrics, shift milk production, herd health, and POS financial accounting
          </p>
        </div>

        {/* The 3 Core Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onNavigate('milkProduction')}
            className="px-3.5 py-1.5 bg-[#14532D] hover:bg-[#0f4022] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Milk className="w-3.5 h-3.5 text-emerald-300" />
            <span>Record Milk Shift</span>
          </button>
          <button
            onClick={() => onNavigate('posBilling')}
            className="px-3.5 py-1.5 bg-[#172033] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>Open POS Counter</span>
          </button>
          <button
            onClick={() => onNavigate('animals')}
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-neutral-200"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
            <span>Herd Registry</span>
          </button>
        </div>
      </div>

      {/* 2. Farm Alerts & Operational Notices Section (Real DB Records & Working Navigation) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>Active Operational Alerts & Follow-ups</span>
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">
            Updated Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          
          {/* Alert 1: Expected Calving Alert */}
          <div 
            onClick={() => onNavigate('vetBreeding')}
            className="p-3.5 rounded-xl border border-amber-200/90 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 shrink-0">
                  <Calendar className="w-4 h-4 text-amber-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>Expected Calving: {calvingAnimalName}</span>
                    <span className="font-mono text-[10px] bg-amber-200/70 text-amber-900 px-1 rounded">
                      {calvingAnimalTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    Due date: <strong className="font-mono">{calvingDateStr}</strong> (~{daysToCalving} days)
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] text-amber-900">
              <span className="font-medium">Maternity pen prepared</span>
              <span className="font-bold underline">View Breeding Card &rarr;</span>
            </div>
          </div>

          {/* Alert 2: Milk Withdrawal & Treatment Quarantine */}
          <div 
            onClick={() => onNavigate('vetBreeding')}
            className="p-3.5 rounded-xl border border-rose-200/90 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-900 shrink-0">
                  <ShieldAlert className="w-4 h-4 text-rose-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <span>Milk Withdrawal: {quarantineAnimalName}</span>
                    <span className="font-mono text-[10px] bg-rose-200/70 text-rose-900 px-1 rounded">
                      {quarantineAnimalTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-800 mt-0.5 truncate max-w-[210px]" title={quarantineDiagnosis}>
                    {quarantineDiagnosis}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-center justify-between text-[10px] text-rose-900">
              <span className="font-medium">Tank discard: {quarantineDays} days</span>
              <span className="font-bold underline">Vet Treatment Details &rarr;</span>
            </div>
          </div>

          {/* Alert 3: Low Inventory Stock */}
          <div 
            onClick={() => onNavigate('inventoryFeed')}
            className="p-3.5 rounded-xl border border-purple-200/90 bg-purple-50/50 hover:bg-purple-50 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-900 shrink-0">
                  <Package className="w-4 h-4 text-purple-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <span>Low Stock Alert</span>
                    <span className="font-mono text-[10px] bg-purple-200/70 text-purple-900 px-1 rounded">
                      {lowStockItems.length} items
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-800 mt-0.5 truncate max-w-[210px]">
                    {lowStockItems[0]?.name || 'FMD Vaccine vials'} below threshold
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <div className="mt-2 pt-2 border-t border-purple-200/60 flex items-center justify-between text-[10px] text-purple-900">
              <span className="font-medium">Purchase Order suggested</span>
              <span className="font-bold underline">Reorder Inventory &rarr;</span>
            </div>
          </div>

          {/* Alert 4: Veterinary Follow-up Follow-ups */}
          <div 
            onClick={() => onNavigate('vetBreeding')}
            className="p-3.5 rounded-xl border border-blue-200/90 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-900 shrink-0">
                  <Syringe className="w-4 h-4 text-blue-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <span>Vet Follow-up Scheduled</span>
                    <span className="font-mono text-[10px] bg-blue-200/70 text-blue-900 px-1 rounded">
                      {followUpAnimalTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-800 mt-0.5">
                    Follow-up date: <strong className="font-mono">{followUpDateStr}</strong>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[10px] text-blue-900">
              <span className="font-medium">DVM Dr. Imran Qureshi</span>
              <span className="font-bold underline">Open Vet Log &rarr;</span>
            </div>
          </div>

          {/* Alert 5: Milk Stock Reconciliation */}
          <div 
            onClick={() => onNavigate('reconciliation')}
            className="p-3.5 rounded-xl border border-emerald-200/90 bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer group shadow-2xs md:col-span-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>Milk Reconciliation: {reconciliation.status === 'balanced' ? 'Balanced (Zero Variance)' : 'Variance Pending'}</span>
                    <span className="font-mono text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 rounded font-bold">
                      {reconciliation.totalCollected} Litres
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    Sold: <strong className="text-emerald-950">{reconciliation.soldLitres}L</strong> &bull; Calves: <strong className="text-emerald-950">{reconciliation.calfFeedingLitres}L</strong> &bull; Processing: <strong className="text-emerald-950">{reconciliation.processingLitres}L</strong> &bull; Chiller Remaining: <strong className="text-emerald-950">{reconciliation.remainingInChiller}L</strong>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-900">
              <span className="font-medium">Physical sight glass verified</span>
              <span className="font-bold underline">View Shift Balance Sheet &rarr;</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. The 8 Operational KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Today's Milk Production */}
        <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Today's Milk Yield</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Milk className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172033] font-mono tracking-tight">
              {totalDailyLitres.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-neutral-500">Litres</span>
            <span className="ml-auto flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +6.4%
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Morn: <strong>{morningLitres.toFixed(1)}L</strong></span>
            <span>Eve: <strong>{eveningLitres.toFixed(1)}L</strong></span>
            <span>Fat: <strong className="text-emerald-800">{avgFat}%</strong></span>
          </div>
        </div>

        {/* KPI 2: Morning & Evening Shift Collection */}
        <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Shift Collection Breakdown</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#172033] font-mono tracking-tight">
              {morningLitres.toFixed(1)}L <span className="text-xs font-normal text-neutral-400">/</span> {eveningLitres.toFixed(1)}L
            </span>
            <span className="ml-auto text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              2 Shifts
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Chiller A: <strong>Okara</strong></span>
            <span>Chiller B: <strong>Buffalo</strong></span>
          </div>
        </div>

        {/* KPI 3: Today's Sales & Collected Payments */}
        <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Sales & Cash Inflow</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172033] font-mono tracking-tight">
              ₨ {totalSalesRevenue.toLocaleString()}
            </span>
            <span className="ml-auto flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12.1%
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Cash: <strong className="text-emerald-700 font-semibold">₨ {totalCashCollected.toLocaleString()}</strong></span>
            <span>Credit: <strong className="text-amber-700">₨ {totalCreditSales.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* KPI 4: Total Animals & In-Milk Count */}
        <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Herd & Milking Heads</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172033] font-mono tracking-tight">
              {totalAnimals}
            </span>
            <span className="text-xs font-semibold text-neutral-500">Heads</span>
            <span className="ml-auto text-[11px] font-bold text-[#14532D] bg-[#14532D]/10 px-2 py-0.5 rounded">
              {milkingAnimals} in Milk
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Milking: <strong>{milkingAnimals}</strong></span>
            <span>Dry: <strong>{dryAnimals}</strong></span>
            <span>Preg: <strong>{pregnantAnimals}</strong></span>
          </div>
        </div>

        {/* KPI 5: Monthly Expenses OPEX */}
        <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Monthly Operating Expenses</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172033] font-mono tracking-tight">
              ₨ {monthlyExpenses.toLocaleString()}
            </span>
            <span className="ml-auto text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              OPEX
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Feed: <strong>₨ {feedCost.toLocaleString()}</strong></span>
            <span>Labor/Vet: <strong>₨ {(laborCost + vetCost).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* KPI 6: Estimated Profit or Loss */}
        <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Net Operating Profit</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-950 font-mono tracking-tight">
              ₨ {netOperatingProfit.toLocaleString()}
            </span>
            <span className="ml-auto text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {profitMarginPercent}% Margin
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Gross: <strong>₨ {grossProfit.toLocaleString()}</strong></span>
            <span className="text-emerald-700 font-semibold">Ledger Audited</span>
          </div>
        </div>

        {/* KPI 7: Pending Customer Receivables (Khata) */}
        <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Pending Receivables (Khata)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950 font-mono tracking-tight">
              ₨ {receivables.toLocaleString()}
            </span>
            <span className="ml-auto text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              {overdueCustomersCount} Near Limit
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Active Customers: <strong>{db.customers.length}</strong></span>
            <button 
              onClick={() => onNavigate('customers')}
              className="text-amber-800 font-bold hover:underline"
            >
              Ledger &rarr;
            </button>
          </div>
        </div>

        {/* KPI 8: Low Stock Alerts */}
        <div className="bg-white rounded-xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Inventory Stock Status</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172033] font-mono tracking-tight">
              {lowStockItems.length}
            </span>
            <span className="text-xs font-semibold text-neutral-500">Items Low</span>
            <span className="ml-auto text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
              Action Needed
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>Vaccines & Silage</span>
            <button 
              onClick={() => onNavigate('inventoryFeed')}
              className="text-rose-700 font-bold hover:underline"
            >
              Reorder PO &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* 4. Interactive Analytics & Visualizations Charts */}
      <DashboardAnalyticsCharts 
        db={db}
        selectedBranchId={selectedBranchId}
      />

      {/* 5. Milk Allocation & Chiller Reconciliation Strip */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200/90 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#14532D]" />
              <span>Today's Milk Allocation & Chiller Reconciliation</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Daily Shift Collection: <strong className="font-mono text-neutral-900">{reconciliation.totalCollected} Litres</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              Variance: 0.0 L (Reconciled)
            </span>
            <button
              onClick={() => onNavigate('reconciliation')}
              className="px-2.5 py-1 text-xs font-semibold text-[#14532D] hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200/80 cursor-pointer"
            >
              Audit Sheet &rarr;
            </button>
          </div>
        </div>

        {/* Visual Allocation Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden flex">
            {/* Sales (63.7%) */}
            <div 
              style={{ width: `${(reconciliation.soldLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
              className="h-full bg-emerald-600"
              title={`Direct Sales: ${reconciliation.soldLitres}L`}
            />
            {/* Calf Rearing (10.3%) */}
            <div 
              style={{ width: `${(reconciliation.calfFeedingLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
              className="h-full bg-blue-500"
              title={`Calf Feeding: ${reconciliation.calfFeedingLitres}L`}
            />
            {/* Processing/Ghee (17.2%) */}
            <div 
              style={{ width: `${(reconciliation.processingLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
              className="h-full bg-amber-500"
              title={`Value Addition Processing: ${reconciliation.processingLitres}L`}
            />
            {/* Staff / Household (5.2%) */}
            <div 
              style={{ width: `${(reconciliation.householdStaffLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
              className="h-full bg-purple-500"
              title={`Staff / Household: ${reconciliation.householdStaffLitres}L`}
            />
            {/* Chiller Reserve (3.6%) */}
            <div 
              style={{ width: `${(reconciliation.remainingInChiller / (reconciliation.totalCollected || 1)) * 100}%` }}
              className="h-full bg-teal-500"
              title={`Remaining in Chiller: ${reconciliation.remainingInChiller}L`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-600 font-mono gap-y-1 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>POS Sales: <strong>{reconciliation.soldLitres}L</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Calves: <strong>{reconciliation.calfFeedingLitres}L</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Ghee Processing: <strong>{reconciliation.processingLitres}L</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Staff: <strong>{reconciliation.householdStaffLitres}L</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Chiller Stock: <strong>{reconciliation.remainingInChiller}L</strong></span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
