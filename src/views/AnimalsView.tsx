import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  HeartPulse, 
  Milk, 
  Sparkles, 
  Trash2, 
  Edit3, 
  X,
  AlertCircle
} from 'lucide-react';
import { Animal, AnimalSpecies, AnimalStatus, AnimalBreed } from '../types';
import { AppDatabase, DairyDatabaseService, COW_URL } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface AnimalsViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
  selectedBranchId: string;
}

export const AnimalsView: React.FC<AnimalsViewProps> = ({
  db,
  onRefreshDb,
  lang,
  selectedBranchId
}) => {
  const t = translations[lang];

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | AnimalSpecies>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AnimalStatus>('all');
  
  // Selected Animal for Profile Modal
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  // New Animal Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formTag, setFormTag] = useState('');
  const [formName, setFormName] = useState('');
  const [formSpecies, setFormSpecies] = useState<AnimalSpecies>('cow');
  const [formBreed, setFormBreed] = useState<AnimalBreed>('Sahiwal');
  const [formStatus, setFormStatus] = useState<AnimalStatus>('milking');
  const [formLactation, setFormLactation] = useState<number>(2);
  const [formCost, setFormCost] = useState<number>(350000);
  const [formYield, setFormYield] = useState<number>(16);
  const [formNotes, setFormNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Filter animals by branch & criteria
  const branchAnimals = db.animals.filter(a => a.branchId === selectedBranchId);
  const filteredAnimals = branchAnimals.filter(animal => {
    const matchesSpecies = speciesFilter === 'all' || animal.species === speciesFilter;
    const matchesStatus = statusFilter === 'all' || animal.status === statusFilter;
    const matchesSearch = 
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.earTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecies && matchesStatus && matchesSearch;
  });

  const handleCreateAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formTag.trim() || !formName.trim()) {
      setErrorMessage('Ear Tag Number and Animal Name are mandatory');
      return;
    }

    // Check duplicate ear tag
    if (db.animals.some(a => a.earTag.toLowerCase() === formTag.trim().toLowerCase())) {
      setErrorMessage(`Animal with ear tag "${formTag}" already exists!`);
      return;
    }

    const newId = `ASK-${formSpecies === 'cow' ? 'CW' : 'BF'}-${Math.floor(100 + Math.random() * 900)}`;

    const newAnimal: Animal = {
      id: newId,
      earTag: formTag.trim().toUpperCase(),
      name: formName.trim(),
      species: formSpecies,
      breed: formBreed,
      gender: 'female',
      dob: '2022-01-01',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: Number(formCost) || 0,
      status: formStatus,
      lactationNumber: Number(formLactation) || 1,
      branchId: selectedBranchId,
      currentAvgDailyYield: Number(formYield) || 0,
      photoUrl: formSpecies === 'cow' ? COW_URL : undefined,
      notes: formNotes.trim()
    };

    DairyDatabaseService.addAnimal(newAnimal);
    onRefreshDb();
    setShowAddModal(false);

    // Reset Form
    setFormTag('');
    setFormName('');
    setFormNotes('');
  };

  const handleDeleteAnimal = (animalId: string) => {
    if (confirm('Are you sure you want to delete this animal record? Historical milk logs will remain archived.')) {
      DairyDatabaseService.deleteAnimal(animalId);
      onRefreshDb();
      setSelectedAnimal(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.animals}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Individual animal registry, lactation history, breeding pedigree & milk yields
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#14532D] to-[#16A34A] hover:from-[#0f4022] hover:to-[#138a3e] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs hover:shadow transition-all self-start sm:self-auto transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 text-emerald-200" />
          <span>{t.addAnimal}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ear tag (e.g. PK-7240), name, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        {/* Species Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs">
          <button
            onClick={() => setSpeciesFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              speciesFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All Herd ({branchAnimals.length})
          </button>
          <button
            onClick={() => setSpeciesFilter('cow')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              speciesFilter === 'cow' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Cows ({branchAnimals.filter(a => a.species === 'cow').length})
          </button>
          <button
            onClick={() => setSpeciesFilter('buffalo')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              speciesFilter === 'buffalo' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Buffaloes ({branchAnimals.filter(a => a.species === 'buffalo').length})
          </button>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Statuses</option>
            <option value="milking">Milking</option>
            <option value="pregnant">Pregnant</option>
            <option value="dry">Dry</option>
            <option value="sick">Sick / In Treatment</option>
            <option value="calved">Recently Calved</option>
          </select>
        </div>
      </div>

      {/* Animal Grid / Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Ear Tag & Name</th>
                <th className="py-3 px-3">Species & Breed</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Daily Yield (L)</th>
                <th className="py-3 px-3 text-center">Lactation #</th>
                <th className="py-3 px-3 text-right">Purchase Cost</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredAnimals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    No animals found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredAnimals.map((animal) => {
                  const isUnderTreatment = animal.status === 'sick';
                  return (
                    <tr
                      key={animal.id}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedAnimal(animal)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-xs">
                            {animal.photoUrl ? (
                              <img
                                src={animal.photoUrl}
                                alt={animal.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              animal.species === 'cow' ? 'CW' : 'BF'
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 flex items-center gap-2">
                              <span>{animal.name}</span>
                              <span className="font-mono text-[11px] font-bold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                                {animal.earTag}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              {animal.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-neutral-800 capitalize">{animal.species}</div>
                        <div className="text-[11px] text-neutral-500">{animal.breed}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          animal.status === 'milking' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          animal.status === 'pregnant' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          animal.status === 'sick' ? 'bg-red-50 text-red-800 border border-red-200' :
                          'bg-neutral-100 text-neutral-700'
                        }`}>
                          {t[animal.status as keyof typeof t] || animal.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-neutral-900 tabular-nums text-sm">
                          {animal.currentAvgDailyYield.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-neutral-500 ml-1">L</span>
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums font-medium text-neutral-700">
                        #{animal.lactationNumber}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-neutral-700 tabular-nums">
                        ₨ {animal.purchaseCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnimal(animal);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          Profile →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Animal Profile Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-emerald-800 text-white px-2 py-1 rounded">
                  {selectedAnimal.earTag}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">{selectedAnimal.name}</h2>
                  <p className="text-xs text-neutral-500">{selectedAnimal.breed} ({selectedAnimal.species})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnimal(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Photo & Quick Metrics */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {selectedAnimal.photoUrl && (
                  <div className="w-48 h-32 rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                    <img
                      src={selectedAnimal.photoUrl}
                      alt={selectedAnimal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="text-neutral-500 text-[11px]">Daily Yield</span>
                    <div className="text-lg font-bold text-emerald-900 tabular-nums">
                      {selectedAnimal.currentAvgDailyYield} L
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="text-neutral-500 text-[11px]">Lactation Cycle</span>
                    <div className="text-lg font-bold text-neutral-900 tabular-nums">
                      #{selectedAnimal.lactationNumber}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="text-neutral-500 text-[11px]">Purchase Cost</span>
                    <div className="text-lg font-bold text-neutral-900 tabular-nums">
                      ₨ {selectedAnimal.purchaseCost.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="text-neutral-500 text-[11px]">Purchase Date</span>
                    <div className="font-semibold text-neutral-900 tabular-nums">
                      {selectedAnimal.purchaseDate || 'N/A'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="text-neutral-500 text-[11px]">Weight (Estimated)</span>
                    <div className="font-semibold text-neutral-900 tabular-nums">
                      {selectedAnimal.weightKg || 450} Kg
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                    <span className="text-neutral-500 text-[11px]">Expected Calving</span>
                    <div className="font-semibold text-neutral-900 tabular-nums">
                      {selectedAnimal.expectedCalvingDate || 'Not Inseminated'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Veterinary History */}
              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <h3 className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-emerald-700" />
                  <span>Veterinary, Vaccination & Health Logs</span>
                </h3>
                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 divide-y divide-neutral-200">
                  {db.vetRecords.filter(v => v.animalId === selectedAnimal.id).length === 0 ? (
                    <div className="py-2 text-neutral-400">No medical illness or treatments logged. Animal is healthy.</div>
                  ) : (
                    db.vetRecords.filter(v => v.animalId === selectedAnimal.id).map(vet => (
                      <div key={vet.id} className="py-2 first:pt-0 last:pb-0">
                        <div className="flex justify-between font-semibold text-neutral-900">
                          <span>{vet.conditionDiagnosis}</span>
                          <span className="text-neutral-500 font-mono text-[11px]">{vet.date}</span>
                        </div>
                        <div className="text-neutral-600 text-[11px] mt-0.5">
                          Treatment: {vet.medicineAdministered} ({vet.dose}) · Vet: {vet.veterinarianName}
                        </div>
                        {vet.withdrawalDays > 0 && (
                          <div className="text-red-700 font-semibold text-[11px] mt-1">
                            Quarantine: {vet.withdrawalDays} days milk withdrawal period
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedAnimal.notes && (
                <div className="border-t border-neutral-200 pt-3">
                  <span className="text-neutral-500 text-[11px] font-medium">Herd Manager Notes:</span>
                  <p className="text-neutral-800 text-xs mt-1">{selectedAnimal.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <button
                onClick={() => handleDeleteAnimal(selectedAnimal.id)}
                className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
              <button
                onClick={() => setSelectedAnimal(null)}
                className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Animal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <h2 className="text-sm font-bold text-neutral-900">Register New Animal</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnimal} className="p-5 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Ear Tag Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PK-7250"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Animal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surraya / Heera"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Species</label>
                  <select
                    value={formSpecies}
                    onChange={(e) => setFormSpecies(e.target.value as AnimalSpecies)}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="cow">Cow (گائے)</option>
                    <option value="buffalo">Buffalo (بھینس)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Breed</label>
                  <select
                    value={formBreed}
                    onChange={(e) => setFormBreed(e.target.value as AnimalBreed)}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Sahiwal">Sahiwal (ساہیوال)</option>
                    <option value="Cholistani">Cholistani (چولستانی)</option>
                    <option value="Nili-Ravi Buffalo">Nili-Ravi Buffalo (نیلی راوی)</option>
                    <option value="Kundi Buffalo">Kundi Buffalo (کنڈی بھینس)</option>
                    <option value="Friesian">Holstein Friesian</option>
                    <option value="Jersey">Jersey</option>
                    <option value="Crossbred">Crossbred</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AnimalStatus)}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="milking">Milking</option>
                    <option value="pregnant">Pregnant</option>
                    <option value="dry">Dry</option>
                    <option value="sick">Sick</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Lactation #</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formLactation}
                    onChange={(e) => setFormLactation(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Daily Yield (L)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formYield}
                    onChange={(e) => setFormYield(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Purchase Cost (₨)</label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={formCost}
                  onChange={(e) => setFormCost(Number(e.target.value))}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Notes / Temperament / Pedigree</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sired by imported semen straw, excellent teat placement"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900 cursor-pointer"
                >
                  Save Animal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
