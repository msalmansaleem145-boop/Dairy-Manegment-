import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, Save, Calendar, ArrowRight } from 'lucide-react';
import { DailyMilkReconciliation } from '../types';
import { AppDatabase, DairyDatabaseService } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface MilkReconciliationViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
  selectedBranchId: string;
}

export const MilkReconciliationView: React.FC<MilkReconciliationViewProps> = ({
  db,
  onRefreshDb,
  lang,
  selectedBranchId
}) => {
  const t = translations[lang];
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);

  // Fetch actual milk logged for selected date & branch
  const dateRecords = db.milkRecords.filter(r => r.date === date && r.branchId === selectedBranchId);
  const morningCollection = dateRecords
    .filter(r => r.shift === 'morning')
    .reduce((s, r) => s + r.quantityLitres, 0);
  const eveningCollection = dateRecords
    .filter(r => r.shift === 'evening')
    .reduce((s, r) => s + r.quantityLitres, 0);
  const totalCollected = morningCollection + eveningCollection;

  // Existing reconciliation if already saved
  const existingRecon = db.milkReconciliations.find(r => r.date === date && r.branchId === selectedBranchId);

  // Outflows
  const [soldLitres, setSoldLitres] = useState<number>(existingRecon ? existingRecon.soldLitres : 74.0);
  const [calfFeeding, setCalfFeeding] = useState<number>(existingRecon ? existingRecon.calfFeedingLitres : 12.0);
  const [staffHousehold, setStaffHousehold] = useState<number>(existingRecon ? existingRecon.householdStaffLitres : 6.0);
  const [processingLitres, setProcessingLitres] = useState<number>(existingRecon ? existingRecon.processingLitres : 20.0);
  const [wastedLitres, setWastedLitres] = useState<number>(existingRecon ? existingRecon.wastedRejectedLitres : 0.0);
  const [remainingChiller, setRemainingChiller] = useState<number>(existingRecon ? existingRecon.remainingInChiller : 4.2);
  const [notes, setNotes] = useState(existingRecon?.operatorNotes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculations
  const totalOutflows = soldLitres + calfFeeding + staffHousehold + processingLitres + wastedLitres + remainingChiller;
  const variance = Number((totalCollected - totalOutflows).toFixed(2));
  const isBalanced = Math.abs(variance) <= 0.05;

  const handleSaveReconciliation = () => {
    const recon: DailyMilkReconciliation = {
      id: existingRecon ? existingRecon.id : `REC-${date}-${selectedBranchId}`,
      date,
      branchId: selectedBranchId,
      morningCollection,
      eveningCollection,
      totalCollected,
      soldLitres,
      calfFeedingLitres: calfFeeding,
      householdStaffLitres: staffHousehold,
      processingLitres,
      wastedRejectedLitres: wastedLitres,
      remainingInChiller: remainingChiller,
      reconciledVariance: variance,
      status: isBalanced ? 'balanced' : 'variance_flagged',
      operatorNotes: notes
    };

    DairyDatabaseService.saveMilkReconciliation(recon);
    onRefreshDb();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.reconciliation}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Strict milk inventory balancing: Inflow (Yield) = Outflow (Sales + Chiller + Processing + Calf Fed)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 font-medium text-neutral-800"
          />
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Daily milk reconciliation locked and saved successfully!</span>
        </div>
      )}

      {/* Main Reconciliation Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6 shadow-xs">
        {/* Balance Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isBalanced 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">
                {isBalanced ? 'Milk Stock Reconciled & Balanced' : 'Unreconciled Stock Variance Detected'}
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {isBalanced 
                  ? 'All collected milk is completely accounted for with 0.00L unexplained variance.' 
                  : `Discrepancy of ${variance > 0 ? `+${variance}` : variance} Litres between collection and allocations.`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75">Variance</div>
            <div className={`text-xl font-bold font-mono tabular-nums ${
              isBalanced ? 'text-emerald-800' : 'text-amber-800'
            }`}>
              {variance > 0 ? `+${variance}` : variance} L
            </div>
          </div>
        </div>

        {/* 2-Column Equation: Inflow vs Outflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Inflow (Harvested Milk) */}
          <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-600">
                1. Total Inflow (Shift Yields)
              </span>
              <span className="font-bold text-neutral-900 tabular-nums text-sm">
                {totalCollected.toFixed(1)} L
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-neutral-200">
                <span className="text-neutral-700 font-medium">Morning Shift Collection:</span>
                <span className="font-bold text-neutral-900 tabular-nums">{morningCollection.toFixed(1)} L</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-neutral-200">
                <span className="text-neutral-700 font-medium">Evening Shift Collection:</span>
                <span className="font-bold text-neutral-900 tabular-nums">{eveningCollection.toFixed(1)} L</span>
              </div>
              <div className="text-[11px] text-neutral-500 pt-1">
                * Pulled automatically from {dateRecords.length} animal milking entries on {date}.
              </div>
            </div>
          </div>

          {/* Column 2: Outflow (Allocations) */}
          <div className="p-5 rounded-xl border border-neutral-200 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-neutral-600">
                2. Outflows & Chiller Stock
              </span>
              <span className="font-bold text-neutral-900 tabular-nums text-sm">
                {totalOutflows.toFixed(1)} L
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="text-neutral-700 font-medium">Milk Sold (POS & Deliveries):</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={soldLitres}
                    onChange={(e) => setSoldLitres(Number(e.target.value))}
                    className="w-24 p-1.5 text-right font-semibold border border-neutral-300 rounded focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-neutral-500 text-[11px]">L</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-neutral-700 font-medium">Calf Milk Feeding:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={calfFeeding}
                    onChange={(e) => setCalfFeeding(Number(e.target.value))}
                    className="w-24 p-1.5 text-right font-semibold border border-neutral-300 rounded focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-neutral-500 text-[11px]">L</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-neutral-700 font-medium">Farm Staff & Household Allowance:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={staffHousehold}
                    onChange={(e) => setStaffHousehold(Number(e.target.value))}
                    className="w-24 p-1.5 text-right font-semibold border border-neutral-300 rounded focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-neutral-500 text-[11px]">L</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-neutral-700 font-medium">Dairy Processing (Ghee / Dahi Vat):</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={processingLitres}
                    onChange={(e) => setProcessingLitres(Number(e.target.value))}
                    className="w-24 p-1.5 text-right font-semibold border border-neutral-300 rounded focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-neutral-500 text-[11px]">L</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-neutral-700 font-medium">Spillage, Loss or Rejected:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={wastedLitres}
                    onChange={(e) => setWastedLitres(Number(e.target.value))}
                    className="w-24 p-1.5 text-right font-semibold border border-neutral-300 rounded focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-neutral-500 text-[11px]">L</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-200">
                <label className="text-neutral-900 font-semibold">Remaining in Chiller Bulk Tank:</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={remainingChiller}
                    onChange={(e) => setRemainingChiller(Number(e.target.value))}
                    className="w-24 p-1.5 text-right font-bold text-emerald-900 border border-emerald-300 bg-emerald-50/50 rounded focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-neutral-500 text-[11px]">L</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operator Notes & Save */}
        <div className="pt-4 border-t border-neutral-200 space-y-3">
          <label className="block text-neutral-700 font-semibold text-xs">
            Operator Reconciliation Remarks / Dipstick Reading Notes:
          </label>
          <input
            type="text"
            placeholder="e.g. Chiller temperature verified at 3.8°C; sight glass verified at 4.2 Litres remaining"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-neutral-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveReconciliation}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Lock & Save Reconciliation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Reconciliations Audit */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 font-bold text-xs text-neutral-900">
          Reconciliation Audit History
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Harvested Yield</th>
                <th className="py-2.5 px-3 text-right">Sold (POS)</th>
                <th className="py-2.5 px-3 text-right">Processed</th>
                <th className="py-2.5 px-3 text-right">Fed & Staff</th>
                <th className="py-2.5 px-3 text-right">Chiller Stock</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {db.milkReconciliations.map(rec => (
                <tr key={rec.id} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3 font-semibold text-neutral-900">{rec.date}</td>
                  <td className="py-2.5 px-3 text-right font-bold tabular-nums">{rec.totalCollected} L</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{rec.soldLitres} L</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{rec.processingLitres} L</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{rec.calfFeedingLitres + rec.householdStaffLitres} L</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{rec.remainingInChiller} L</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                      rec.status === 'balanced' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {rec.status === 'balanced' ? 'Balanced (0.00L)' : `Variance (${rec.reconciledVariance}L)`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
