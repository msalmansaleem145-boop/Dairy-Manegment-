import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingDown, 
  Scale, 
  BookOpen, 
  X, 
  CheckCircle2, 
  Truck
} from 'lucide-react';
import { InventoryItem, FeedPlan, Supplier } from '../types';
import { AppDatabase, DairyDatabaseService } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface InventoryFeedViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
  selectedBranchId: string;
}

export const InventoryFeedView: React.FC<InventoryFeedViewProps> = ({
  db,
  onRefreshDb,
  lang,
  selectedBranchId
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'inventory' | 'feed' | 'suppliers'>('inventory');
  const [search, setSearch] = useState('');
  
  // Feed Consumption Modal
  const [showLogFeedModal, setShowLogFeedModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('FP-1');
  const [animalCount, setAnimalCount] = useState<number>(7);
  const [operator, setOperator] = useState('Bashir Ahmed');

  // New Stock Item Modal
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCat, setItemCat] = useState<InventoryItem['category']>('feed_fodder');
  const [itemUnit, setItemUnit] = useState('bag');
  const [itemStock, setItemStock] = useState<number>(50);
  const [itemMinAlert, setItemMinAlert] = useState<number>(15);
  const [itemCost, setItemCost] = useState<number>(3800);
  const [itemLoc, setItemLoc] = useState('Main Store');

  const [notificationMsg, setNotificationMsg] = useState('');

  // Feed Cost Per Litre Metric
  const todayLitres = db.milkRecords
    .filter(r => r.branchId === selectedBranchId)
    .reduce((s, r) => s + r.quantityLitres, 0) || 116;
  const todayFeedExpense = db.feedConsumptions
    .filter(f => f.branchId === selectedBranchId)
    .reduce((s, f) => s + f.totalCost, 0) || 6800;
  const feedCostPerLitre = Number((todayFeedExpense / (todayLitres || 1)).toFixed(2));

  const filteredInventory = db.inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogDailyFeed = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = db.feedPlans.find(p => p.id === selectedPlanId);
    if (!plan) return;

    const totalCost = plan.costPerDayPerAnimal * animalCount;
    const totalKg = plan.dailyRationItems.reduce((s, i) => s + i.quantityKg, 0) * animalCount;

    DairyDatabaseService.recordFeedConsumption({
      id: `FC-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      branchId: selectedBranchId,
      feedPlanId: plan.id,
      feedPlanName: plan.name,
      animalCount,
      totalKg,
      totalCost,
      operatorName: operator
    });

    onRefreshDb();
    setShowLogFeedModal(false);
    setNotificationMsg(`Logged daily feed for ${animalCount} animals (₨ ${totalCost.toLocaleString()}). Expense posted to accounts.`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const currentDb = DairyDatabaseService.getDatabase();
    currentDb.inventory.unshift({
      id: `INV-ITM-${Date.now().toString().slice(-4)}`,
      name: itemName.trim(),
      category: itemCat,
      unit: itemUnit,
      currentStock: Number(itemStock),
      minStockAlert: Number(itemMinAlert),
      unitCost: Number(itemCost),
      location: itemLoc
    });
    DairyDatabaseService.saveDatabase(currentDb);
    onRefreshDb();
    setShowNewItemModal(false);
    setItemName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.inventoryFeed}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Wanda feed stocks, corn silage, veterinary supplies & dairy nutrition ration planning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogFeedModal(true)}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Log Daily Herd Feeding</span>
          </button>
          <button
            onClick={() => setShowNewItemModal(true)}
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* KPIs & Feed Efficiency Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <span className="text-neutral-500 text-xs">Feed Cost Per Litre of Milk</span>
          <div className="text-2xl font-bold text-emerald-900 tabular-nums mt-1">
            ₨ {feedCostPerLitre} <span className="text-xs font-normal text-neutral-500">/ Litre</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Standard Pakistani benchmark: ₨ 55 - 65 / Litre
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <span className="text-neutral-500 text-xs">Corn Silage Pit Inventory</span>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums mt-1">
            12,500 <span className="text-xs font-normal text-neutral-500">Kg available</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            ~52 days reserve for milking herd
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <span className="text-neutral-500 text-xs">Low Stock Alert Items</span>
          <div className="text-2xl font-bold text-amber-700 tabular-nums mt-1">
            {db.inventory.filter(i => i.currentStock <= i.minStockAlert).length} <span className="text-xs font-normal text-neutral-500">supplies to reorder</span>
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            FMD Vaccine & Mineral Premix near threshold
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'inventory' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Warehouse Stock & Reorder Alerts
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'feed' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Daily Herd Rations & TMR Plans
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'suppliers' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Feed Mills & Medicine Suppliers
        </button>
      </div>

      {/* Tab 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs text-neutral-900">Current Supplies Ledger</h2>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search stock..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-y border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Stock On Hand</th>
                  <th className="py-2.5 px-3 text-right">Min Reorder Level</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Total Valuation</th>
                  <th className="py-2.5 px-3">Storage Bin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredInventory.map(item => {
                  const isLow = item.currentStock <= item.minStockAlert;
                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-neutral-900">{item.name}</div>
                        <div className="text-[11px] font-mono text-neutral-400">{item.id}</div>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-neutral-700">
                        {item.category.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <span className={`font-bold ${isLow ? 'text-amber-700' : 'text-neutral-900'}`}>
                          {item.currentStock} {item.unit}
                        </span>
                        {isLow && (
                          <div className="text-[10px] text-amber-700 font-semibold flex items-center justify-end gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low Stock!</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-neutral-500">
                        {item.minStockAlert} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-neutral-700">
                        ₨ {item.unitCost.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-neutral-900">
                        ₨ {(item.currentStock * item.unitCost).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 text-[11px]">
                        {item.location}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Feed Ration Plans */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {db.feedPlans.map(plan => (
              <div key={plan.id} className="p-5 bg-white rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">{plan.name}</h3>
                    <span className="text-[11px] text-emerald-800 font-semibold uppercase">
                      Target Group: {plan.targetGroup}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-neutral-500">Daily Cost / Animal</span>
                    <div className="font-bold text-emerald-900 text-sm tabular-nums">
                      ₨ {plan.costPerDayPerAnimal}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-neutral-700 text-[11px]">Daily Ration Ingredients:</div>
                  <div className="divide-y divide-neutral-100">
                    {plan.dailyRationItems.map((ing, idx) => (
                      <div key={idx} className="py-1 flex justify-between text-neutral-600">
                        <span>{ing.itemName}</span>
                        <span className="font-semibold tabular-nums text-neutral-900">
                          {ing.quantityKg} Kg (₨ {ing.quantityKg * ing.unitCost}/day)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {plan.notes && (
                  <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                    {plan.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Contact Person & Phone</th>
                <th className="py-2.5 px-3 text-right">Owed Payables (باقی)</th>
                <th className="py-2.5 px-3">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {db.suppliers.map(sup => (
                <tr key={sup.id} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3 font-semibold text-neutral-900">{sup.name}</td>
                  <td className="py-2.5 px-3 capitalize text-neutral-700">{sup.category}</td>
                  <td className="py-2.5 px-3">
                    <div className="text-neutral-900 font-medium">{sup.contactPerson}</div>
                    <div className="text-[11px] text-neutral-500">{sup.phone}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-neutral-900">
                    ₨ {sup.balance.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 text-[11px]">{sup.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Daily Feed Modal */}
      {showLogFeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-neutral-900">Log Daily Feed Consumption</h3>
            
            <form onSubmit={handleLogDailyFeed} className="space-y-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Ration Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                >
                  {db.feedPlans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₨ {p.costPerDayPerAnimal}/head)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Number of Milking Animals</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={animalCount}
                  onChange={(e) => setAnimalCount(Number(e.target.value))}
                  className="w-full p-2 border border-neutral-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Feed Operator / Feeder</label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-neutral-500 text-[11px]">Estimated Daily Feed Cost:</span>
                <div className="text-base font-bold text-emerald-900 tabular-nums">
                  ₨ {((db.feedPlans.find(p => p.id === selectedPlanId)?.costPerDayPerAnimal || 0) * animalCount).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowLogFeedModal(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Post Feed Consumption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Item Modal */}
      {showNewItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-neutral-900">Add Inventory Stock Item</h3>
            
            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rhodes Grass Bales / Calcium D3"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Category</label>
                  <select
                    value={itemCat}
                    onChange={(e) => setItemCat(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="feed_fodder">Feed & Fodder</option>
                    <option value="medicine_vaccine">Veterinary Medicine</option>
                    <option value="packaging">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Current Quantity</label>
                  <input
                    type="number"
                    value={itemStock}
                    onChange={(e) => setItemStock(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Min Reorder Alert</label>
                  <input
                    type="number"
                    value={itemMinAlert}
                    onChange={(e) => setItemMinAlert(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Cost Per Unit (₨)</label>
                <input
                  type="number"
                  value={itemCost}
                  onChange={(e) => setItemCost(Number(e.target.value))}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowNewItemModal(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
