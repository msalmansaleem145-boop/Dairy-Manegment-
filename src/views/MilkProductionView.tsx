import React, { useState } from 'react';
import { 
  Milk, 
  Plus, 
  Calendar, 
  Check, 
  AlertCircle, 
  Clock, 
  Search, 
  Flame, 
  Layers,
  CheckCircle2
} from 'lucide-react';
import { MilkProductionRecord, MilkShift, MilkQualityStatus, Animal } from '../types';
import { AppDatabase, DairyDatabaseService } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface MilkProductionViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
  selectedBranchId: string;
}

export const MilkProductionView: React.FC<MilkProductionViewProps> = ({
  db,
  onRefreshDb,
  lang,
  selectedBranchId
}) => {
  const t = translations[lang];
  const todayStr = new Date().toISOString().split('T')[0];

  const [activeShift, setActiveShift] = useState<MilkShift>('morning');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [entryMode, setEntryMode] = useState<'bulk' | 'single'>('bulk');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchHistory, setSearchHistory] = useState('');

  // Bulk entry state for milking animals
  const branchMilkingAnimals = db.animals.filter(
    a => a.branchId === selectedBranchId && (a.status === 'milking' || a.status === 'calved')
  );

  const [bulkEntries, setBulkEntries] = useState<Record<string, {
    quantity: number;
    fat: number;
    snf: number;
    quality: MilkQualityStatus;
  }>>(() => {
    const initial: any = {};
    branchMilkingAnimals.forEach(a => {
      // Half of daily yield per shift
      const estShiftYield = Number((a.currentAvgDailyYield * 0.52).toFixed(1));
      initial[a.id] = {
        quantity: estShiftYield,
        fat: a.species === 'buffalo' ? 6.8 : 4.8,
        snf: 8.9,
        quality: 'grade_a'
      };
    });
    return initial;
  });

  // Single Entry Form state
  const [singleAnimalId, setSingleAnimalId] = useState(branchMilkingAnimals[0]?.id || '');
  const [singleQty, setSingleQty] = useState(8.5);
  const [singleFat, setSingleFat] = useState(5.0);
  const [singleSnf, setSingleSnf] = useState(8.8);
  const [singleQuality, setSingleQuality] = useState<MilkQualityStatus>('grade_a');
  const [singleChiller, setSingleChiller] = useState('Chiller Tank A (Okara)');
  const [singleNotes, setSingleNotes] = useState('');

  // Filter historical records
  const branchRecords = db.milkRecords.filter(r => r.branchId === selectedBranchId);
  const filteredHistory = branchRecords.filter(r => {
    const animal = db.animals.find(a => a.id === r.animalId);
    const matchesDate = !selectedDate || r.date === selectedDate;
    const matchesSearch = 
      r.animalId.toLowerCase().includes(searchHistory.toLowerCase()) ||
      (animal && animal.name.toLowerCase().includes(searchHistory.toLowerCase())) ||
      (animal && animal.earTag.toLowerCase().includes(searchHistory.toLowerCase()));
    return matchesDate && matchesSearch;
  });

  // Calculations for today's selected shift
  const shiftRecords = branchRecords.filter(r => r.date === selectedDate && r.shift === activeShift);
  const shiftTotalLitres = shiftRecords.reduce((sum, r) => sum + r.quantityLitres, 0);
  const shiftAvgFat = shiftRecords.length > 0 
    ? (shiftRecords.reduce((sum, r) => sum + r.fatPercentage, 0) / shiftRecords.length).toFixed(2)
    : '0.00';
  const shiftAvgSnf = shiftRecords.length > 0
    ? (shiftRecords.reduce((sum, r) => sum + r.snfPercentage, 0) / shiftRecords.length).toFixed(2)
    : '0.00';

  const handleBulkYieldChange = (animalId: string, field: 'quantity' | 'fat' | 'snf', value: number) => {
    setBulkEntries(prev => ({
      ...prev,
      [animalId]: {
        ...prev[animalId],
        [field]: value
      }
    }));
  };

  const handleSaveBulkShift = () => {
    const newRecords: MilkProductionRecord[] = [];
    const timestamp = new Date().toISOString();

    branchMilkingAnimals.forEach(animal => {
      const entry = bulkEntries[animal.id];
      if (entry && entry.quantity > 0) {
        // Prevent duplicate for same date, shift, animal
        const isDuplicate = branchRecords.some(
          r => r.date === selectedDate && r.shift === activeShift && r.animalId === animal.id
        );

        if (!isDuplicate) {
          newRecords.push({
            id: `MLK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: selectedDate,
            shift: activeShift,
            animalId: animal.id,
            quantityLitres: entry.quantity,
            fatPercentage: entry.fat,
            snfPercentage: entry.snf,
            qualityStatus: entry.quality,
            chillerTankId: animal.species === 'buffalo' ? 'Chiller Tank B (Buffalo)' : 'Chiller Tank A (Okara)',
            operatorId: 'Muhammad Aslam',
            branchId: selectedBranchId,
            createdAt: timestamp
          });
        }
      }
    });

    if (newRecords.length > 0) {
      DairyDatabaseService.recordMilkProduction(newRecords);
      onRefreshDb();
      setSuccessMessage(`Successfully saved ${newRecords.length} milk entries for ${activeShift} shift!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      alert('Entries for these animals have already been logged for this shift today, or quantity is 0.');
    }
  };

  const handleSaveSingleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleAnimalId) return;

    const isDuplicate = branchRecords.some(
      r => r.date === selectedDate && r.shift === activeShift && r.animalId === singleAnimalId
    );

    if (isDuplicate) {
      if (!confirm('An entry for this animal already exists in this shift. Record duplicate entry anyway?')) {
        return;
      }
    }

    const newRecord: MilkProductionRecord = {
      id: `MLK-${Date.now()}`,
      date: selectedDate,
      shift: activeShift,
      animalId: singleAnimalId,
      quantityLitres: Number(singleQty),
      fatPercentage: Number(singleFat),
      snfPercentage: Number(singleSnf),
      qualityStatus: singleQuality,
      chillerTankId: singleChiller,
      operatorId: 'Muhammad Aslam',
      branchId: selectedBranchId,
      notes: singleNotes,
      createdAt: new Date().toISOString()
    };

    DairyDatabaseService.recordMilkProduction([newRecord]);
    onRefreshDb();
    setSuccessMessage(`Recorded ${singleQty}L for ${singleAnimalId}!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.milkProduction}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Morning and evening milking records, fat & SNF testing, and bulk tank storage
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Shift Toggle */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveShift('morning')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeShift === 'morning' ? 'bg-white text-emerald-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.morning}</span>
            </button>
            <button
              onClick={() => setActiveShift('evening')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeShift === 'evening' ? 'bg-white text-emerald-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.evening}</span>
            </button>
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 font-medium text-neutral-800"
          />
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Shift Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <span className="text-neutral-500 text-xs">Total Shift Collection</span>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums mt-1">
            {shiftTotalLitres.toFixed(1)} <span className="text-xs font-normal text-neutral-500">Litres</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <span className="text-neutral-500 text-xs">Avg Fat %</span>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums mt-1">
            {shiftAvgFat}%
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <span className="text-neutral-500 text-xs">Avg Solid Not Fat (SNF) %</span>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums mt-1">
            {shiftAvgSnf}%
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white">
          <span className="text-neutral-500 text-xs">Milked Herd Count</span>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums mt-1">
            {shiftRecords.length} <span className="text-xs font-normal text-neutral-500">animals logged</span>
          </div>
        </div>
      </div>

      {/* Entry Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setEntryMode('bulk')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              entryMode === 'bulk' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Fast Shift Batch Roster (Recommended)
          </button>
          <button
            onClick={() => setEntryMode('single')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              entryMode === 'single' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Individual Animal Entry
          </button>
        </div>
      </div>

      {/* Bulk Fast Entry Grid */}
      {entryMode === 'bulk' ? (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Active Milking Roster — {activeShift.toUpperCase()} Shift ({selectedDate})
              </h2>
              <p className="text-xs text-neutral-500">
                Adjust quantities and lab test figures. Click save to commit full shift data into bulk milk tanks.
              </p>
            </div>
            <button
              onClick={handleSaveBulkShift}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save Complete {activeShift} Shift</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-y border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Ear Tag & Cow</th>
                  <th className="py-2.5 px-3">Species</th>
                  <th className="py-2.5 px-3">Yield (Litres)</th>
                  <th className="py-2.5 px-3">Fat %</th>
                  <th className="py-2.5 px-3">SNF %</th>
                  <th className="py-2.5 px-3">Quality</th>
                  <th className="py-2.5 px-3">Shift Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {branchMilkingAnimals.map(animal => {
                  const alreadyLogged = branchRecords.some(
                    r => r.date === selectedDate && r.shift === activeShift && r.animalId === animal.id
                  );
                  const entry = bulkEntries[animal.id] || {
                    quantity: 7.5,
                    fat: 5.0,
                    snf: 8.9,
                    quality: 'grade_a'
                  };

                  return (
                    <tr key={animal.id} className={alreadyLogged ? 'bg-neutral-50/70 opacity-75' : 'hover:bg-neutral-50/50'}>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-neutral-900">{animal.name}</div>
                        <div className="text-[11px] font-mono text-neutral-500">{animal.earTag} ({animal.id})</div>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-neutral-700">
                        {animal.species}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          disabled={alreadyLogged}
                          value={entry.quantity}
                          onChange={(e) => handleBulkYieldChange(animal.id, 'quantity', Number(e.target.value))}
                          className="w-24 p-1.5 border border-neutral-300 rounded font-semibold text-neutral-900 tabular-nums focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          step="0.1"
                          min="2.0"
                          max="10.0"
                          disabled={alreadyLogged}
                          value={entry.fat}
                          onChange={(e) => handleBulkYieldChange(animal.id, 'fat', Number(e.target.value))}
                          className="w-20 p-1.5 border border-neutral-300 rounded text-neutral-900 tabular-nums focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          step="0.1"
                          min="7.0"
                          max="12.0"
                          disabled={alreadyLogged}
                          value={entry.snf}
                          onChange={(e) => handleBulkYieldChange(animal.id, 'snf', Number(e.target.value))}
                          className="w-20 p-1.5 border border-neutral-300 rounded text-neutral-900 tabular-nums focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          Grade A
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {alreadyLogged ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                            <Check className="w-3.5 h-3.5" />
                            <span>Logged Today</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Pending Entry</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Single Animal Entry Form */
        <div className="bg-white rounded-xl border border-neutral-200 p-5 max-w-xl">
          <h2 className="text-sm font-bold text-neutral-900 mb-4">Log Single Milk Entry</h2>
          <form onSubmit={handleSaveSingleEntry} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Select Animal</label>
              <select
                value={singleAnimalId}
                onChange={(e) => setSingleAnimalId(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {branchMilkingAnimals.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.earTag}) — {a.breed}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Litres</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={singleQty}
                  onChange={(e) => setSingleQty(Number(e.target.value))}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-semibold"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="10"
                  value={singleFat}
                  onChange={(e) => setSingleFat(Number(e.target.value))}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">SNF %</label>
                <input
                  type="number"
                  step="0.1"
                  min="7"
                  max="12"
                  value={singleSnf}
                  onChange={(e) => setSingleSnf(Number(e.target.value))}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Quality Grade</label>
                <select
                  value={singleQuality}
                  onChange={(e) => setSingleQuality(e.target.value as MilkQualityStatus)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="grade_a">Grade A (Premium)</option>
                  <option value="standard">Standard</option>
                  <option value="substandard">Substandard</option>
                  <option value="rejected">Rejected / Spoilage</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Chiller Bulk Tank</label>
                <select
                  value={singleChiller}
                  onChange={(e) => setSingleChiller(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="Chiller Tank A (Okara)">Chiller Tank A (Cow Milk)</option>
                  <option value="Chiller Tank B (Buffalo)">Chiller Tank B (Buffalo Milk)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Observation / Notes</label>
              <input
                type="text"
                placeholder="e.g. Mild kick during teat dip; milk clear"
                value={singleNotes}
                onChange={(e) => setSingleNotes(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save Milk Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Production Logs History */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-neutral-900">Milking Shift Audit Log</h3>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search tag or name..."
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Date & Shift</th>
                <th className="py-2.5 px-3">Animal</th>
                <th className="py-2.5 px-3 text-right">Quantity (L)</th>
                <th className="py-2.5 px-3 text-right">Fat %</th>
                <th className="py-2.5 px-3 text-right">SNF %</th>
                <th className="py-2.5 px-3">Chiller Tank</th>
                <th className="py-2.5 px-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredHistory.map(record => {
                const animal = db.animals.find(a => a.id === record.animalId);
                return (
                  <tr key={record.id} className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-neutral-900">{record.date}</div>
                      <div className="text-[11px] text-neutral-500 capitalize">{record.shift} Shift</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-neutral-900">{animal?.name || record.animalId}</div>
                      <div className="text-[11px] font-mono text-neutral-500">{animal?.earTag || ''}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-neutral-900 tabular-nums">
                      {record.quantityLitres.toFixed(1)} L
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-emerald-800 font-medium">
                      {record.fatPercentage.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-neutral-700">
                      {record.snfPercentage.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 text-[11px]">
                      {record.chillerTankId}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 text-[11px]">
                      {record.operatorId}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
