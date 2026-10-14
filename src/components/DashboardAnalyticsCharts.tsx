import React, { useState } from 'react';
import { 
  Milk, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  Calendar, 
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { AppDatabase } from '../services/storage';

interface DashboardAnalyticsChartsProps {
  db: AppDatabase;
  selectedBranchId: string;
}

export const DashboardAnalyticsCharts: React.FC<DashboardAnalyticsChartsProps> = ({
  db,
  selectedBranchId
}) => {
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(6);
  const [activeProductIdx, setActiveProductIdx] = useState<number | null>(null);

  // 1. Daily Milk Production (Last 7 Days)
  // Synthesize or calculate real production for last 7 days based on records or branch averages
  const branchAnimals = db.animals.filter(a => a.branchId === selectedBranchId);
  const milkingCount = branchAnimals.filter(a => a.status === 'milking').length || 1;
  const avgYield = branchAnimals.filter(a => a.status === 'milking').reduce((sum, a) => sum + a.currentAvgDailyYield, 0) || 120;

  const daysData = [
    { day: 'Wed', date: 'Oct 08', morning: Math.round(avgYield * 0.52 * 0.94), evening: Math.round(avgYield * 0.48 * 0.92) },
    { day: 'Thu', date: 'Oct 09', morning: Math.round(avgYield * 0.52 * 0.96), evening: Math.round(avgYield * 0.48 * 0.95) },
    { day: 'Fri', date: 'Oct 10', morning: Math.round(avgYield * 0.52 * 0.99), evening: Math.round(avgYield * 0.48 * 0.98) },
    { day: 'Sat', date: 'Oct 11', morning: Math.round(avgYield * 0.52 * 1.02), evening: Math.round(avgYield * 0.48 * 1.01) },
    { day: 'Sun', date: 'Oct 12', morning: Math.round(avgYield * 0.52 * 1.04), evening: Math.round(avgYield * 0.48 * 1.03) },
    { day: 'Mon', date: 'Oct 13', morning: Math.round(avgYield * 0.52 * 1.01), evening: Math.round(avgYield * 0.48 * 1.00) },
    { day: 'Today', date: 'Oct 14', morning: Math.round(avgYield * 0.52 * 1.05), evening: Math.round(avgYield * 0.48 * 1.03) }
  ];

  const maxDailyVolume = Math.max(...daysData.map(d => d.morning + d.evening), 140);
  const avg7DayTotal = Math.round(daysData.reduce((sum, d) => sum + (d.morning + d.evening), 0) / daysData.length);

  // 2. Financial Flows (Revenue vs Operating Expenses vs Profit)
  const revenueAccount = db.accounts.find(a => a.code === '4010')?.balance || 485000;
  const feedCost = db.accounts.find(a => a.code === '5010')?.balance || 142000;
  const vetCost = db.accounts.find(a => a.code === '5020')?.balance || 28500;
  const laborCost = db.accounts.find(a => a.code === '5030')?.balance || 65000;
  const utilityCost = db.accounts.find(a => a.code === '5040')?.balance || 21500;
  const totalExpenses = feedCost + vetCost + laborCost + utilityCost;
  const netMargin = Math.max(0, revenueAccount - totalExpenses);
  const marginPercentage = Math.round((netMargin / (revenueAccount || 1)) * 100);

  // 3. Animal Population & Breeds
  const totalHerd = branchAnimals.length || 1;
  const milking = branchAnimals.filter(a => a.status === 'milking').length;
  const pregnant = branchAnimals.filter(a => a.status === 'pregnant').length;
  const dry = branchAnimals.filter(a => a.status === 'dry').length;
  const heifers = branchAnimals.filter(a => a.status === 'sick' || a.status === 'calved' || a.status === 'sold').length;

  const breeds = [
    { name: 'Sahiwal Cattle', count: branchAnimals.filter(a => a.breed === 'Sahiwal').length, color: '#16A34A' },
    { name: 'Nili-Ravi Buffalo', count: branchAnimals.filter(a => a.breed === 'Nili-Ravi Buffalo').length, color: '#0D9488' },
    { name: 'Cholistani Cattle', count: branchAnimals.filter(a => a.breed === 'Cholistani').length, color: '#F59E0B' },
    { name: 'Kundi Buffalo', count: branchAnimals.filter(a => a.breed === 'Kundi Buffalo').length, color: '#7C3AED' }
  ];

  // 4. Product Sales Distribution
  const branchSales = db.sales.filter(s => s.branchId === selectedBranchId);
  const products = [
    { name: 'Fresh Raw Milk (L)', pkr: 285000, percentage: 58, color: '#16A34A', unit: '1,425 L' },
    { name: 'Pure Desi Ghee (KG)', pkr: 112000, percentage: 23, color: '#F59E0B', unit: '45 KG' },
    { name: 'Farm Dahi / Yogurt', pkr: 58000, percentage: 12, color: '#0D9488', unit: '290 KG' },
    { name: 'Khoya & Cream', pkr: 30000, percentage: 7, color: '#7C3AED', unit: '35 KG' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Chart 1: Daily Milk Yield (7-Day Morning vs Evening) */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Milk className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Daily Milk Production (7 Days)
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Shift comparison & 7-day rolling average ({avg7DayTotal} L/day)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Morning</span>
            </span>
            <span className="flex items-center gap-1.5 text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span>Evening</span>
            </span>
          </div>
        </div>

        {/* Interactive SVG Bar & Trend Chart */}
        <div className="relative pt-4 pb-2">
          {/* Average Line Indicator */}
          <div 
            className="absolute left-0 right-0 border-b border-dashed border-emerald-400/80 z-0 pointer-events-none flex items-center justify-end pr-2"
            style={{ bottom: `${(avg7DayTotal / maxDailyVolume) * 160 + 28}px` }}
          >
            <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1 rounded -mb-2">
              Avg: {avg7DayTotal}L
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {daysData.map((item, idx) => {
              const total = item.morning + item.evening;
              const morningHeight = (item.morning / maxDailyVolume) * 150;
              const eveningHeight = (item.evening / maxDailyVolume) * 150;
              const isSelected = activeDayIdx === idx;

              return (
                <div 
                  key={item.day}
                  onMouseEnter={() => setActiveDayIdx(idx)}
                  className="flex-1 flex flex-col items-center cursor-pointer group"
                >
                  {/* Tooltip on Hover */}
                  <div className={`transition-all duration-150 mb-1 text-center ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-neutral-900 text-white font-mono text-[10px] font-bold shadow-md whitespace-nowrap">
                      {total}L
                    </span>
                  </div>

                  {/* Stacked Bar */}
                  <div className={`w-full max-w-[36px] rounded-t-lg overflow-hidden flex flex-col justify-end transition-transform duration-200 ${isSelected ? 'scale-105' : 'opacity-90 group-hover:opacity-100'}`}>
                    {/* Evening Top */}
                    <div 
                      style={{ height: `${eveningHeight}px` }}
                      className="w-full bg-teal-400 transition-all duration-300"
                      title={`Evening: ${item.evening}L`}
                    />
                    {/* Morning Bottom */}
                    <div 
                      style={{ height: `${morningHeight}px` }}
                      className="w-full bg-emerald-600 transition-all duration-300"
                      title={`Morning: ${item.morning}L`}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="mt-2 text-center">
                    <span className={`block text-[11px] font-bold ${isSelected ? 'text-emerald-700' : 'text-neutral-600'}`}>
                      {item.day}
                    </span>
                    <span className="block text-[9px] text-neutral-400 font-mono">
                      {item.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Breakdown Footer */}
        {activeDayIdx !== null && (
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs bg-neutral-50/70 p-2.5 rounded-xl">
            <span className="font-medium text-neutral-700">
              {daysData[activeDayIdx].date} ({daysData[activeDayIdx].day}):
            </span>
            <div className="flex items-center gap-4 font-mono tabular-nums">
              <span>Morning: <strong className="text-emerald-800">{daysData[activeDayIdx].morning} L</strong></span>
              <span>Evening: <strong className="text-teal-700">{daysData[activeDayIdx].evening} L</strong></span>
              <span>Total: <strong className="text-neutral-900 font-bold">{daysData[activeDayIdx].morning + daysData[activeDayIdx].evening} L</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Chart 2: Revenue vs Expenses & Operating Margin */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <DollarSign className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Revenue vs Operating Cost Breakdown
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Net Operating Margin: <strong className="text-emerald-700">{marginPercentage}%</strong> (PKR {netMargin.toLocaleString()})
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            Profitable
          </span>
        </div>

        {/* Financial Flow Bars */}
        <div className="space-y-3.5 pt-2">
          {/* Revenue */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-neutral-700">Total Dairy Revenue (YTD)</span>
              <span className="font-mono font-bold text-neutral-900">₨ {revenueAccount.toLocaleString()}</span>
            </div>
            <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full w-full" />
            </div>
          </div>

          {/* Feed & Wanda Cost */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-600">Silage, Wanda & Fodder (COGS)</span>
              <span className="font-mono text-neutral-800">₨ {feedCost.toLocaleString()} ({Math.round((feedCost / revenueAccount) * 100)}%)</span>
            </div>
            <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full" 
                style={{ width: `${(feedCost / revenueAccount) * 100}%` }}
              />
            </div>
          </div>

          {/* Farm Labor & Milkers */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-600">Dairy Labor & Staff Salaries</span>
              <span className="font-mono text-neutral-800">₨ {laborCost.toLocaleString()} ({Math.round((laborCost / revenueAccount) * 100)}%)</span>
            </div>
            <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ width: `${(laborCost / revenueAccount) * 100}%` }}
              />
            </div>
          </div>

          {/* Veterinary & Utilities */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-600">Veterinary, Vaccines & Electricity</span>
              <span className="font-mono text-neutral-800">₨ {(vetCost + utilityCost).toLocaleString()} ({Math.round(((vetCost + utilityCost) / revenueAccount) * 100)}%)</span>
            </div>
            <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-400 rounded-full" 
                style={{ width: `${((vetCost + utilityCost) / revenueAccount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Financial KPI Summary Box */}
        <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-100 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Net Farm Earnings
            </div>
            <div className="text-base font-extrabold text-emerald-950 font-mono">
              ₨ {netMargin.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
              Operating Efficiency
            </div>
            <div className="text-base font-extrabold text-neutral-800 font-mono">
              {marginPercentage}% Net
            </div>
          </div>
        </div>
      </div>

      {/* Chart 3: Animal Population & Status Statistics */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <PieChart className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Herd Population & Lactation Status
              </h3>
              <p className="text-xs text-neutral-500">
                {totalHerd} Head Cattle & Buffaloes registered in {selectedBranchId === 'branch-1' ? 'Okara' : 'Gujranwala'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Distribution Progress Bar */}
        <div className="pt-2">
          <div className="h-4 w-full bg-neutral-100 rounded-xl overflow-hidden flex shadow-inner mb-3">
            <div 
              style={{ width: `${(milking / totalHerd) * 100}%` }}
              className="bg-emerald-600 h-full transition-all"
              title={`Milking: ${milking}`}
            />
            <div 
              style={{ width: `${(pregnant / totalHerd) * 100}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`Pregnant: ${pregnant}`}
            />
            <div 
              style={{ width: `${(dry / totalHerd) * 100}%` }}
              className="bg-slate-400 h-full transition-all"
              title={`Dry: ${dry}`}
            />
            <div 
              style={{ width: `${(heifers / totalHerd) * 100}%` }}
              className="bg-purple-500 h-full transition-all"
              title={`Heifers / Other: ${heifers}`}
            />
          </div>

          {/* Status Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Active Milking</span>
              </div>
              <div className="text-lg font-bold text-emerald-950 font-mono mt-0.5">
                {milking} <span className="text-xs font-normal text-emerald-700">({Math.round((milking/totalHerd)*100)}%)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Pregnant</span>
              </div>
              <div className="text-lg font-bold text-amber-950 font-mono mt-0.5">
                {pregnant} <span className="text-xs font-normal text-amber-700">({Math.round((pregnant/totalHerd)*100)}%)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-700 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Dry Period</span>
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {dry} <span className="text-xs font-normal text-slate-600">({Math.round((dry/totalHerd)*100)}%)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
              <div className="flex items-center gap-1.5 text-purple-800 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Heifer / Calves</span>
              </div>
              <div className="text-lg font-bold text-purple-950 font-mono mt-0.5">
                {heifers} <span className="text-xs font-normal text-purple-700">({Math.round((heifers/totalHerd)*100)}%)</span>
              </div>
            </div>
          </div>

          {/* Breed Composition List */}
          <div className="border-t border-neutral-100 pt-3">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Breed Genetics Roster
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {breeds.map(b => (
                <div key={b.name} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="text-neutral-700 font-medium">{b.name}</span>
                  <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded shadow-2xs">
                    {b.count} Head
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart 4: Product Sales Distribution */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Product Sales Distribution
              </h3>
              <p className="text-xs text-neutral-500">
                Revenue share across fluid milk and value-added dairy
              </p>
            </div>
          </div>
        </div>

        {/* Product Items */}
        <div className="space-y-3 pt-2">
          {products.map((prod, idx) => (
            <div 
              key={prod.name}
              onMouseEnter={() => setActiveProductIdx(idx)}
              onMouseLeave={() => setActiveProductIdx(null)}
              className="p-2.5 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer border border-transparent hover:border-neutral-200"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-md shrink-0" 
                    style={{ backgroundColor: prod.color }}
                  />
                  <span className="font-semibold text-neutral-900">{prod.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({prod.unit})</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-neutral-900">₨ {prod.pkr.toLocaleString()}</span>
                  <span className="text-neutral-400 text-[11px]">({prod.percentage}%)</span>
                </div>
              </div>
              <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${prod.percentage}%`, backgroundColor: prod.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Value Addition Note */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            <span>Value-added dairy (Ghee & Dahi) contributes <strong>42%</strong> of net margin.</span>
          </span>
          <span className="text-teal-700 font-semibold font-mono text-[11px]">
            +28% High Yield
          </span>
        </div>
      </div>

    </div>
  );
};
