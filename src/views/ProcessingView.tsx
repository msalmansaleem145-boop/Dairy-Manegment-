import React, { useState } from 'react';
import { 
  FlaskConical, 
  Plus, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Scale, 
  AlertCircle,
  X,
  Calendar
} from 'lucide-react';
import { ProductBatch, Product, ProductUnit } from '../types';
import { AppDatabase, DairyDatabaseService, FACILITY_URL } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface ProcessingViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
  selectedBranchId: string;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  db,
  onRefreshDb,
  lang,
  selectedBranchId
}) => {
  const t = translations[lang];

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('prod-3'); // Desi Ghee default
  const [inputMilkLitres, setInputMilkLitres] = useState<number>(150);
  const [milkCostPerLitre, setMilkCostPerLitre] = useState<number>(165);
  const [additionalCost, setAdditionalCost] = useState<number>(1800); // Gas, glass jars
  const [expectedOutput, setExpectedOutput] = useState<number>(9.5);
  const [actualOutput, setActualOutput] = useState<number>(9.4);
  const [operatorName, setOperatorName] = useState('Bashir Ahmed');
  const [batchNotes, setBatchNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Target products that can be processed
  const processableProducts = db.products.filter(p => p.category === 'value_added');

  const selectedProduct = db.products.find(p => p.id === selectedProductId);

  // Dynamic calculations
  const rawMilkCostTotal = inputMilkLitres * milkCostPerLitre;
  const totalBatchCost = rawMilkCostTotal + additionalCost;
  const calculatedUnitCost = actualOutput > 0 ? Number((totalBatchCost / actualOutput).toFixed(2)) : 0;
  const yieldEfficiency = expectedOutput > 0 ? Number(((actualOutput / expectedOutput) * 100).toFixed(1)) : 100;
  const wastageLoss = Number(Math.max(0, expectedOutput - actualOutput).toFixed(2));
  const estimatedBatchRevenue = selectedProduct ? actualOutput * selectedProduct.sellingPrice : 0;
  const estimatedProfit = Math.max(0, estimatedBatchRevenue - totalBatchCost);

  // Auto-tune expected outputs when product changes
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    if (prodId === 'prod-3') {
      // Desi Ghee (~16L milk per 1kg ghee)
      setExpectedOutput(Number((inputMilkLitres / 16).toFixed(1)));
      setActualOutput(Number((inputMilkLitres / 16).toFixed(1)));
    } else if (prodId === 'prod-4') {
      // Dahi (~1.02 ratio)
      setExpectedOutput(Number((inputMilkLitres * 0.96).toFixed(1)));
      setActualOutput(Number((inputMilkLitres * 0.96).toFixed(1)));
    } else if (prodId === 'prod-5') {
      // Khoya (~4.5L milk per 1kg khoya)
      setExpectedOutput(Number((inputMilkLitres / 4.8).toFixed(1)));
      setActualOutput(Number((inputMilkLitres / 4.8).toFixed(1)));
    } else if (prodId === 'prod-6') {
      // Butter (~11L milk per 1kg butter)
      setExpectedOutput(Number((inputMilkLitres / 11).toFixed(1)));
      setActualOutput(Number((inputMilkLitres / 11).toFixed(1)));
    } else if (prodId === 'prod-7') {
      // Paneer (~6L milk per 1kg paneer)
      setExpectedOutput(Number((inputMilkLitres / 6).toFixed(1)));
      setActualOutput(Number((inputMilkLitres / 6).toFixed(1)));
    }
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + 6);

    const batchNumber = `BTCH-${selectedProduct.code.substring(0, 3)}-${Date.now().toString().slice(-4)}`;

    const newBatch: ProductBatch = {
      id: `BTCH-${Date.now()}`,
      batchNumber,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productionDate: todayStr,
      inputMilkLitres,
      milkCostPerLitre,
      additionalCost,
      expectedOutputQty: expectedOutput,
      actualOutputQty: actualOutput,
      unit: selectedProduct.unit,
      yieldEfficiencyPct: yieldEfficiency,
      lossWastageQty: wastageLoss,
      unitCostCalculated: calculatedUnitCost,
      expiryDate: expDate.toISOString().split('T')[0],
      operatorName,
      branchId: selectedBranchId,
      notes: batchNotes
    };

    DairyDatabaseService.recordProductProcessingBatch(newBatch);
    onRefreshDb();
    setShowBatchModal(false);
    setSuccessMsg(`Batch ${batchNumber} processed successfully! Stock updated.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.processing}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Conversion of raw milk into Desi Ghee, Khoya, Dahi, Butter & artisanal cheeses with batch costing
          </p>
        </div>
        <button
          onClick={() => setShowBatchModal(true)}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Processing Batch</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Facility Hero Banner & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-neutral-200 relative min-h-[160px] bg-neutral-900 flex items-end">
          <img
            src={FACILITY_URL}
            alt="Stainless steel milk processing facility"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="relative z-10 p-5 text-white bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent w-full">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Hygienic Dairy Value-Addition Vat
            </span>
            <h2 className="text-base font-bold mt-1">
              Commercial Processing, Butter Churning & Desi Ghee Refining
            </h2>
            <p className="text-xs text-neutral-300 mt-0.5 max-w-xl">
              Automatic conversion of bulk tank milk into high-margin products with precise input-output yield reconciliation.
            </p>
          </div>
        </div>

        {/* Value-Add Summary Cards */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="p-4 rounded-xl border border-neutral-200 bg-white">
            <span className="text-neutral-500 text-xs">Total Batches Produced</span>
            <div className="text-2xl font-bold text-neutral-900 tabular-nums mt-1">
              {db.productBatches.length} <span className="text-xs font-normal text-neutral-500">batches</span>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-neutral-200 bg-white">
            <span className="text-neutral-500 text-xs">Desi Ghee Inventory on Hand</span>
            <div className="text-2xl font-bold text-emerald-800 tabular-nums mt-1">
              {db.products.find(p => p.id === 'prod-3')?.stock || 35} <span className="text-xs font-normal text-neutral-500">Kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-neutral-900">Historical Processing Batches</h3>
          <span className="text-[11px] text-neutral-500 font-mono">
            {db.productBatches.length} records logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Batch # & Date</th>
                <th className="py-2.5 px-3">Finished Product</th>
                <th className="py-2.5 px-3 text-right">Milk Input (L)</th>
                <th className="py-2.5 px-3 text-right">Output Yield</th>
                <th className="py-2.5 px-3 text-right">Yield Efficiency</th>
                <th className="py-2.5 px-3 text-right">Calculated Unit Cost</th>
                <th className="py-2.5 px-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {db.productBatches.map(batch => (
                <tr key={batch.id} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-neutral-900 font-mono">{batch.batchNumber}</div>
                    <div className="text-[11px] text-neutral-500">{batch.productionDate}</div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-neutral-800">
                    {batch.productName}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-medium text-neutral-700">
                    {batch.inputMilkLitres} L
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-neutral-900">
                    {batch.actualOutputQty} {batch.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-emerald-800">
                    {batch.yieldEfficiencyPct}%
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-neutral-900">
                    ₨ {Math.round(batch.unitCostCalculated).toLocaleString()} /{batch.unit}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 text-[11px]">
                    {batch.operatorName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h2 className="text-sm font-bold text-neutral-900">Log New Dairy Processing Batch</h2>
              <button onClick={() => setShowBatchModal(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Target Finished Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                >
                  {processableProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.nameUrdu}) — Selling: ₨ {p.sellingPrice}/{p.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Input Raw Milk (L) *</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={inputMilkLitres}
                    onChange={(e) => {
                      const l = Number(e.target.value);
                      setInputMilkLitres(l);
                      if (selectedProductId === 'prod-3') {
                        setExpectedOutput(Number((l / 16).toFixed(1)));
                        setActualOutput(Number((l / 16).toFixed(1)));
                      }
                    }}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Milk Cost / Litre (₨)</label>
                  <input
                    type="number"
                    value={milkCostPerLitre}
                    onChange={(e) => setMilkCostPerLitre(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Packaging & Fuel (₨)</label>
                  <input
                    type="number"
                    value={additionalCost}
                    onChange={(e) => setAdditionalCost(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Expected Output ({selectedProduct?.unit})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={expectedOutput}
                    onChange={(e) => setExpectedOutput(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Actual Measured Output *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={actualOutput}
                    onChange={(e) => setActualOutput(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600 font-bold text-emerald-900"
                  />
                </div>
              </div>

              {/* Live Costing and Profitability Preview */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Input Production Cost:</span>
                  <span className="font-bold tabular-nums">₨ {totalBatchCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Calculated Cost Price Per {selectedProduct?.unit}:</span>
                  <span className="font-bold text-emerald-800 tabular-nums">₨ {calculatedUnitCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Yield Efficiency:</span>
                  <span className="font-semibold text-emerald-700 tabular-nums">{yieldEfficiency}%</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200 font-bold text-neutral-900">
                  <span>Projected Batch Gross Profit:</span>
                  <span className="tabular-nums text-emerald-900">₨ {estimatedProfit.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Processing In-charge / Operator</label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Batch Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Churned from high butterfat Nili-Ravi cream"
                    value={batchNotes}
                    onChange={(e) => setBatchNotes(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Post Processing Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
