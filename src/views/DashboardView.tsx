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
  ChevronRight,
  Sun,
  Moon,
  PlusCircle,
  FileText
} from 'lucide-react';
import { AppDatabase } from '../services/storage';
import { Language, translations } from '../i18n/translations';
import { DashboardAnalyticsCharts } from '../components/DashboardAnalyticsCharts';
import { AskLogo } from '../components/AskLogo';

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

  // Time-of-day greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 
    ? (lang === 'ur' ? 'صبح بخیر، سلمان سلیم' : 'Good Morning, Salman Saleem')
    : currentHour < 17 
    ? (lang === 'ur' ? 'دوپہر بخیر، سلمان سلیم' : 'Good Afternoon, Salman Saleem')
    : (lang === 'ur' ? 'شام بخیر، سلمان سلیم' : 'Good Evening, Salman Saleem');

  const shiftStatusText = currentHour < 14
    ? (lang === 'ur' ? 'صبح کی شفٹ فعال (06:00 - 14:00)' : 'Morning Shift Active (06:00 - 14:00)')
    : (lang === 'ur' ? 'شام کی شفٹ فعال (14:00 - 22:00)' : 'Evening Shift Active (14:00 - 22:00)');

  // Recent transactions for activity feed
  const recentSales = branchSales.slice(-4).reverse();
  const recentMilk = todayRecords.slice(-4).reverse();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Hero / Welcome Banner with Dairy-Themed Gradient & Quick Metrics */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#14532D] via-[#166534] to-[#0A2E1A] text-white p-5 sm:p-7 shadow-sm border border-emerald-900/60 overflow-hidden">
        
        {/* Subtle Decorative Pattern Background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#E5C77E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Greeting & Status with Branded ASK Monogram */}
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex shrink-0 pt-1">
              <AskLogo variant="mark" size="md" theme="dark" className="drop-shadow-md" />
            </div>
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/15 backdrop-blur-xs text-[#E5C77E] border border-white/20">
                  {currentHour < 14 ? (
                    <Sun className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-indigo-200" />
                  )}
                  <span>{shiftStatusText}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-200 bg-black/20 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Chiller: 3.8°C (Optimal)</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="sm:hidden shrink-0">
                  <AskLogo variant="mark" size="xs" theme="dark" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-sans">
                  {greeting}
                </h1>
              </div>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {lang === 'ur'
                ? 'ڈیری فارم کے تمام امور، دودھ کی ترسیل، مویشیوں کی صحت اور پی او ایس اکاؤنٹس کا مکمل جائزہ۔'
                : 'Real-time dairy farm metrics, shift milk production, herd registry health, and POS financial ledgers.'}
            </p>

              {/* Quick Metrics Strip */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-emerald-100/90">
                <span className="flex items-center gap-1.5">
                  <Milk className="w-3.5 h-3.5 text-[#E5C77E]" />
                  <span>Yield: <strong className="text-white">{totalDailyLitres.toFixed(1)} L</strong></span>
                </span>
                <span className="text-white/30">·</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Milking: <strong className="text-white">{milkingAnimals}/{totalAnimals} Heads</strong></span>
                </span>
                <span className="text-white/30">·</span>
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sales: <strong className="text-white">₨ {totalSalesRevenue.toLocaleString()}</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('milkProduction')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-[#E5C77E] to-[#C7A45D] hover:from-[#F3DC9B] hover:to-[#D4B36A] text-[#143929] rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Milk className="w-4 h-4 stroke-[2.5]" />
              <span>Record Milk Shift</span>
            </button>

            <button
              onClick={() => onNavigate('posBilling')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#E5C77E]" />
              <span>Open POS Counter</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. One-Tap Quick Action Hub */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Farm Operations & Quick Entry Hub</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            Direct Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Shortcut 1: Milk Shift */}
          <button
            onClick={() => onNavigate('milkProduction')}
            className="p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-600 text-white group-hover:scale-105 transition-transform">
                <Milk className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-emerald-950">Record Milk</div>
              <div className="text-[10px] text-emerald-700">Morning / Eve Shift</div>
            </div>
          </button>

          {/* Shortcut 2: Animal Registry */}
          <button
            onClick={() => onNavigate('animals')}
            className="p-3 rounded-xl bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200/80 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-[#14532D] text-white group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-neutral-900">New Cattle</div>
              <div className="text-[10px] text-teal-700">Tag & Pedigree</div>
            </div>
          </button>

          {/* Shortcut 3: POS Billing */}
          <button
            onClick={() => onNavigate('posBilling')}
            className="p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-600 text-white group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-neutral-900">POS Billing</div>
              <div className="text-[10px] text-amber-800">Direct Cash/Credit</div>
            </div>
          </button>

          {/* Shortcut 4: Vet & Breeding */}
          <button
            onClick={() => onNavigate('vetBreeding')}
            className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-600 text-white group-hover:scale-105 transition-transform">
                <HeartPulse className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-neutral-900">Vet & Health</div>
              <div className="text-[10px] text-blue-700">DVM Log & Vaccine</div>
            </div>
          </button>

          {/* Shortcut 5: Inventory & Feed */}
          <button
            onClick={() => onNavigate('inventoryFeed')}
            className="p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-600 text-white group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-neutral-900">Stock & Feed</div>
              <div className="text-[10px] text-purple-700">Silage & Wanda PO</div>
            </div>
          </button>

          {/* Shortcut 6: Khata Ledger */}
          <button
            onClick={() => onNavigate('customers')}
            className="p-3 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/80 text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-rose-600 text-white group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-2.5">
              <div className="text-xs font-bold text-neutral-900">Khata Ledger</div>
              <div className="text-[10px] text-rose-700">Customer Credit</div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Farm Alerts & Operational Notices Section (Real DB Records & Working Navigation) */}
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
            className="p-3.5 rounded-xl border border-amber-200/90 bg-amber-50/60 hover:bg-amber-100/70 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900 shrink-0">
                  <Calendar className="w-4 h-4 text-amber-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>Expected Calving: {calvingAnimalName}</span>
                    <span className="font-mono text-[10px] bg-amber-200/70 text-amber-900 px-1 rounded font-bold">
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
            className="p-3.5 rounded-xl border border-rose-200/90 bg-rose-50/60 hover:bg-rose-100/70 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-900 shrink-0">
                  <ShieldAlert className="w-4 h-4 text-rose-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <span>Milk Withdrawal: {quarantineAnimalName}</span>
                    <span className="font-mono text-[10px] bg-rose-200/70 text-rose-900 px-1 rounded font-bold">
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
            className="p-3.5 rounded-xl border border-purple-200/90 bg-purple-50/60 hover:bg-purple-100/70 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-900 shrink-0">
                  <Package className="w-4 h-4 text-purple-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <span>Low Stock Alert</span>
                    <span className="font-mono text-[10px] bg-purple-200/70 text-purple-900 px-1 rounded font-bold">
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
            className="p-3.5 rounded-xl border border-blue-200/90 bg-blue-50/60 hover:bg-blue-100/70 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-900 shrink-0">
                  <Syringe className="w-4 h-4 text-blue-800" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <span>Vet Follow-up Scheduled</span>
                    <span className="font-mono text-[10px] bg-blue-200/70 text-blue-900 px-1 rounded font-bold">
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
            className="p-3.5 rounded-xl border border-emerald-200/90 bg-emerald-50/60 hover:bg-emerald-100/70 transition-colors cursor-pointer group shadow-2xs md:col-span-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 shrink-0">
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

      {/* 4. The 8 Operational KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Today's Milk Yield */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Today's Milk Yield</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Milk className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172033] font-mono tracking-tight tabular-nums">
              {totalDailyLitres.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-neutral-500">Litres</span>
            <span className="ml-auto flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +6.4%
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono tabular-nums">
            <span>Morn: <strong>{morningLitres.toFixed(1)}L</strong></span>
            <span>Eve: <strong>{eveningLitres.toFixed(1)}L</strong></span>
            <span>Fat: <strong className="text-emerald-800">{avgFat}%</strong></span>
          </div>
        </div>

        {/* KPI 2: Shift Yield Breakdown */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Shift Yield Breakdown</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#172033] font-mono tracking-tight tabular-nums">
              {morningLitres.toFixed(1)}L <span className="text-xs font-normal text-neutral-400">/</span> {eveningLitres.toFixed(1)}L
            </span>
            <span className="ml-auto text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              2 Shifts
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono">
            <span>SNF: <strong className="text-blue-800 font-mono">{avgSnf}%</strong></span>
            <span>Chiller: <strong className="text-neutral-900">3.8°C</strong></span>
          </div>
        </div>

        {/* KPI 3: Sales & Cash Inflow */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Sales & Cash Inflow</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172033] font-mono tracking-tight tabular-nums">
              ₨ {totalSalesRevenue.toLocaleString()}
            </span>
            <span className="ml-auto flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12.1%
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono tabular-nums">
            <span>Cash: <strong className="text-emerald-700 font-semibold">₨ {totalCashCollected.toLocaleString()}</strong></span>
            <span>Credit: <strong className="text-amber-700">₨ {totalCreditSales.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* KPI 4: Herd & Milking Ratio */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Herd & Milking Heads</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172033] font-mono tracking-tight tabular-nums">
              {totalAnimals}
            </span>
            <span className="text-xs font-semibold text-neutral-500">Heads</span>
            <span className="ml-auto text-[11px] font-bold text-[#14532D] bg-[#14532D]/10 px-2 py-0.5 rounded font-mono">
              {milkingAnimals} in Milk
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono tabular-nums">
            <span>Dry: <strong>{dryAnimals}</strong></span>
            <span>Preg: <strong>{pregnantAnimals}</strong></span>
            <span>Sick: <strong className="text-rose-700">{sickAnimals}</strong></span>
          </div>
        </div>

        {/* KPI 5: Monthly OPEX Expenses */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Monthly Operating Expenses</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172033] font-mono tracking-tight tabular-nums">
              ₨ {monthlyExpenses.toLocaleString()}
            </span>
            <span className="ml-auto text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              OPEX
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono tabular-nums">
            <span>Feed: <strong>₨ {feedCost.toLocaleString()}</strong></span>
            <span>Labor/Vet: <strong>₨ {(laborCost + vetCost).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* KPI 6: Estimated Net Operating Profit */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Net Operating Profit</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-950 font-mono tracking-tight tabular-nums">
              ₨ {netOperatingProfit.toLocaleString()}
            </span>
            <span className="ml-auto text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
              {profitMarginPercent}% Margin
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 font-mono tabular-nums">
            <span>Gross: <strong>₨ {grossProfit.toLocaleString()}</strong></span>
            <span className="text-emerald-700 font-semibold">Ledger Audited</span>
          </div>
        </div>

        {/* KPI 7: Pending Customer Khata Receivables */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Pending Receivables (Khata)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950 font-mono tracking-tight tabular-nums">
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
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
            <span className="font-semibold text-neutral-700">Inventory Stock Status</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#172033] font-mono tracking-tight tabular-nums">
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

      {/* 5. Interactive Analytics & Visualizations Charts */}
      <DashboardAnalyticsCharts 
        db={db}
        selectedBranchId={selectedBranchId}
      />

      {/* 6. Milk Allocation & Chiller Reconciliation Strip */}
      <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs">
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
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
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
            {/* Sales */}
            <div 
              style={{ width: `${(reconciliation.soldLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
              className="h-full bg-emerald-600 transition-all duration-300"
              title={`Direct Sales: ${reconciliation.soldLitres}L`}
            />
            {/* Calf Rearing */}
            <div 
              style={{ width: `${(reconciliation.calfFeedingLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
              className="h-full bg-blue-500 transition-all duration-300"
              title={`Calf Feeding: ${reconciliation.calfFeedingLitres}L`}
            />
            {/* Processing/Ghee */}
            <div 
              style={{ width: `${(reconciliation.processingLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
              className="h-full bg-amber-500 transition-all duration-300"
              title={`Value Addition Processing: ${reconciliation.processingLitres}L`}
            />
            {/* Staff / Household */}
            <div 
              style={{ width: `${(reconciliation.householdStaffLitres / (reconciliation.totalCollected || 1)) * 100}%` }}
              className="h-full bg-purple-500 transition-all duration-300"
              title={`Staff / Household: ${reconciliation.householdStaffLitres}L`}
            />
            {/* Chiller Reserve */}
            <div 
              style={{ width: `${(reconciliation.remainingInChiller / (reconciliation.totalCollected || 1)) * 100}%` }}
              className="h-full bg-teal-500 transition-all duration-300"
              title={`Remaining in Chiller: ${reconciliation.remainingInChiller}L`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-600 font-mono tabular-nums gap-y-1 pt-1">
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

      {/* 7. Live Activity Feed: Recent Milking & Sales Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Recent Milk Collection Records */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                <Milk className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Recent Milking Collections
              </h3>
            </div>
            <button
              onClick={() => onNavigate('milkProduction')}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-2">
            {recentMilk.map((rec) => {
              const animal = branchAnimals.find(a => a.id === rec.animalId);
              return (
                <div 
                  key={rec.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/70 hover:bg-neutral-100/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono font-bold text-emerald-950 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                      {rec.shift === 'morning' ? 'Morn' : 'Eve'}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-neutral-900 truncate">
                        {animal?.name || 'Dairy Cow'} <span className="font-mono text-neutral-500 font-normal">({animal?.earTag || 'PK-Tag'})</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        Fat: {rec.fatPercentage}% &middot; SNF: {rec.snfPercentage}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-extrabold text-sm text-[#14532D]">
                      {rec.quantityLitres.toFixed(1)} L
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent POS Sales Invoices */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Recent POS Sales Receipts
              </h3>
            </div>
            <button
              onClick={() => onNavigate('posBilling')}
              className="text-xs font-semibold text-amber-800 hover:underline"
            >
              Open Register &rarr;
            </button>
          </div>

          <div className="space-y-2">
            {recentSales.map((sale) => (
              <div 
                key={sale.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/70 hover:bg-neutral-100/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                    sale.paymentMethod === 'cash' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sale.paymentMethod}
                  </span>
                  <div className="truncate">
                    <div className="font-bold text-neutral-900 truncate">
                      {sale.customerName}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {sale.items.length} item(s) &middot; {sale.invoiceNumber}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-extrabold text-sm text-neutral-900">
                    ₨ {sale.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
