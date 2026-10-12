import React, { useState } from 'react';
import { 
  HeartPulse, 
  Plus, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import { VeterinaryRecord, BreedingRecord, Animal } from '../types';
import { AppDatabase, DairyDatabaseService } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface VeterinaryBreedingViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
  selectedBranchId: string;
}

export const VeterinaryBreedingView: React.FC<VeterinaryBreedingViewProps> = ({
  db,
  onRefreshDb,
  lang,
  selectedBranchId
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'treatments' | 'breeding' | 'vaccines'>('breeding');

  // Treatment Modal
  const [showVetModal, setShowVetModal] = useState(false);
  const [vetAnimalId, setVetAnimalId] = useState(db.animals[0]?.id || '');
  const [vetType, setVetType] = useState<VeterinaryRecord['type']>('treatment');
  const [vetDiagnosis, setVetDiagnosis] = useState('');
  const [vetMedicine, setVetMedicine] = useState('');
  const [vetDose, setVetDose] = useState('');
  const [vetCost, setVetCost] = useState<number>(2500);
  const [withdrawalDays, setWithdrawalDays] = useState<number>(3);
  const [vetName, setVetName] = useState('Dr. Imran Qureshi (DVM)');

  // Breeding Modal
  const [showBreedingModal, setShowBreedingModal] = useState(false);
  const [breedAnimalId, setBreedAnimalId] = useState(db.animals[0]?.id || '');
  const [breedEvent, setBreedEvent] = useState<BreedingRecord['eventType']>('artificial_insemination');
  const [semenStraw, setSemenStraw] = useState('Pure Sahiwal Semen Straw #SHW-9901');
  const [technician, setTechnician] = useState('Zahid Hussain (AI Tech)');
  const [pdResult, setPdResult] = useState<'pregnant' | 'non_pregnant' | 'recheck'>('pregnant');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const branchAnimals = db.animals.filter(a => a.branchId === selectedBranchId);

  // Quarantine list (cows under withdrawal period)
  const quarantinedCows = db.vetRecords.filter(v => v.withdrawalDays > 0);

  // Pregnant cows with countdown
  const pregnantCows = branchAnimals.filter(a => a.status === 'pregnant' && a.expectedCalvingDate);

  const handleCreateVetRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = db.animals.find(a => a.id === vetAnimalId);
    if (!animal) return;

    const newRecord: VeterinaryRecord = {
      id: `VET-${Date.now()}`,
      animalId: animal.id,
      animalEarTag: animal.earTag,
      date: new Date().toISOString().split('T')[0],
      type: vetType,
      conditionDiagnosis: vetDiagnosis,
      medicineAdministered: vetMedicine,
      dose: vetDose,
      cost: Number(vetCost) || 0,
      withdrawalDays: Number(withdrawalDays) || 0,
      veterinarianName: vetName
    };

    DairyDatabaseService.recordVeterinaryEvent(newRecord);
    onRefreshDb();
    setShowVetModal(false);
    setSuccessMsg(`Logged veterinary treatment for ${animal.name} (${animal.earTag})`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleCreateBreedingRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = db.animals.find(a => a.id === breedAnimalId);
    if (!animal) return;

    const newRecord: BreedingRecord = {
      id: `BRD-${Date.now()}`,
      animalId: animal.id,
      animalEarTag: animal.earTag,
      date: new Date().toISOString().split('T')[0],
      eventType: breedEvent,
      semenStrawId: semenStraw,
      technicianName: technician,
      pdResult: breedEvent === 'pd_check' ? pdResult : undefined,
      notes
    };

    DairyDatabaseService.recordBreedingEvent(newRecord);
    onRefreshDb();
    setShowBreedingModal(false);
    setSuccessMsg(`Breeding record logged. Gestation and expected calving date updated!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.vetBreeding}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Artificial insemination (AI), pregnancy checks, calving countdown & milk safety withdrawal quarantine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBreedingModal(true)}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Record AI / Calving</span>
          </button>
          <button
            onClick={() => setShowVetModal(true)}
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Log Vet Treatment</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Critical Milk Withdrawal Alert Banner */}
      {quarantinedCows.length > 0 && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/80 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-red-900">
              Active Milk Withdrawal Quarantine ({quarantinedCows.length} Animal Under Treatment)
            </span>
            <p className="text-red-800 text-[11px] mt-0.5 leading-relaxed">
              Treated milk contains antibiotic or drug residues and MUST be segregated and discarded. Do not mix into sale chillers!
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {quarantinedCows.map(q => (
                <span key={q.id} className="bg-white border border-red-300 text-red-900 font-mono text-[11px] px-2 py-0.5 rounded font-bold">
                  Tag: {q.animalEarTag} — {q.conditionDiagnosis} ({q.withdrawalDays} days)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Breeding & Calving Countdown Strip */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-neutral-900">Expected Calving Schedule & Gestation Tracking</h2>
          </div>
          <span className="text-xs font-medium text-neutral-500">
            {pregnantCows.length} Pregnant Animals Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pregnantCows.map(cow => {
            const today = new Date();
            const calvingDate = new Date(cow.expectedCalvingDate!);
            const diffTime = calvingDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <div key={cow.id} className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-neutral-900 text-xs flex items-center gap-2">
                    <span>{cow.name}</span>
                    <span className="font-mono text-[10px] text-neutral-600 bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                      {cow.earTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {cow.breed} ({cow.species}) · Expected: <strong>{cow.expectedCalvingDate}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold text-sm tabular-nums ${daysLeft <= 14 ? 'text-amber-800' : 'text-emerald-800'}`}>
                    {daysLeft > 0 ? `In ${daysLeft} days` : 'Due Any Day!'}
                  </div>
                  <span className="text-[10px] text-neutral-500">Maternity Prep</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('breeding')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'breeding' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Breeding & Artificial Insemination Log
        </button>
        <button
          onClick={() => setActiveTab('treatments')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'treatments' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Medical Treatments & Drug Records
        </button>
        <button
          onClick={() => setActiveTab('vaccines')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
            activeTab === 'vaccines' ? 'bg-emerald-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Vaccination Protocol (FMD, HS, BQ)
        </button>
      </div>

      {/* Breeding Records Table */}
      {activeTab === 'breeding' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Animal Ear Tag</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Semen Straw / Pedigree</th>
                <th className="py-2.5 px-3">PD Result / Status</th>
                <th className="py-2.5 px-3">Expected Calving</th>
                <th className="py-2.5 px-3">Inseminator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {db.breedingRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-600">{rec.date}</td>
                  <td className="py-2.5 px-3 font-bold text-neutral-900 font-mono">{rec.animalEarTag}</td>
                  <td className="py-2.5 px-3 capitalize font-semibold text-neutral-800">
                    {rec.eventType.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 text-[11px]">
                    {rec.semenStrawId || '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    {rec.pdResult ? (
                      <span className="font-semibold text-emerald-800 capitalize bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {rec.pdResult}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-neutral-900">
                    {rec.expectedCalvingDate || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 text-[11px]">
                    {rec.technicianName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Treatments Table */}
      {activeTab === 'treatments' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Animal Tag</th>
                <th className="py-2.5 px-3">Diagnosis / Illness</th>
                <th className="py-2.5 px-3">Medicine Administered</th>
                <th className="py-2.5 px-3">Withdrawal</th>
                <th className="py-2.5 px-3 text-right">Cost (₨)</th>
                <th className="py-2.5 px-3">Veterinarian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {db.vetRecords.map(vet => (
                <tr key={vet.id} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-600">{vet.date}</td>
                  <td className="py-2.5 px-3 font-bold font-mono text-neutral-900">{vet.animalEarTag}</td>
                  <td className="py-2.5 px-3 font-semibold text-neutral-800">{vet.conditionDiagnosis}</td>
                  <td className="py-2.5 px-3 text-neutral-600 text-[11px]">
                    {vet.medicineAdministered} ({vet.dose})
                  </td>
                  <td className="py-2.5 px-3">
                    {vet.withdrawalDays > 0 ? (
                      <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px]">
                        {vet.withdrawalDays} Days Withheld
                      </span>
                    ) : (
                      <span className="text-neutral-400">0 Days</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-neutral-900">
                    ₨ {vet.cost.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 text-[11px]">{vet.veterinarianName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vaccines Protocol Tab */}
      {activeTab === 'vaccines' && (
        <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900">Annual Herd Vaccination Calendar</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 space-y-1.5">
              <span className="font-bold text-neutral-900">Foot and Mouth Disease (FMD / منہ کھر)</span>
              <p className="text-neutral-600 text-[11px]">Bi-annual booster (March & September)</p>
              <div className="text-emerald-800 font-semibold text-[11px]">Status: Up to date</div>
            </div>
            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 space-y-1.5">
              <span className="font-bold text-neutral-900">Hemorrhagic Septicemia (HS / گل گھوٹو)</span>
              <p className="text-neutral-600 text-[11px]">Pre-monsoon administration (May / June)</p>
              <div className="text-emerald-800 font-semibold text-[11px]">Status: Completed</div>
            </div>
            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 space-y-1.5">
              <span className="font-bold text-neutral-900">Black Quarter (BQ / چوڑیا)</span>
              <p className="text-neutral-600 text-[11px]">Young stock & heifers pre-monsoon</p>
              <div className="text-emerald-800 font-semibold text-[11px]">Status: Active</div>
            </div>
          </div>
        </div>
      )}

      {/* Treatment Modal */}
      {showVetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-neutral-900">Record Veterinary Treatment</h3>

            <form onSubmit={handleCreateVetRecord} className="space-y-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Select Animal *</label>
                <select
                  value={vetAnimalId}
                  onChange={(e) => setVetAnimalId(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                >
                  {branchAnimals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.earTag}) — {a.breed}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Diagnosis / Medical Condition *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clinical Mastitis / Foot Rot / Fever"
                  value={vetDiagnosis}
                  onChange={(e) => setVetDiagnosis(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Medicine *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oxytetracycline LA"
                    value={vetMedicine}
                    onChange={(e) => setVetMedicine(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Dose / Route</label>
                  <input
                    type="text"
                    placeholder="e.g. 20ml IM"
                    value={vetDose}
                    onChange={(e) => setVetDose(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Milk Withdrawal (Days)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={withdrawalDays}
                    onChange={(e) => setWithdrawalDays(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-bold text-red-700"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Treatment Cost (₨)</label>
                  <input
                    type="number"
                    value={vetCost}
                    onChange={(e) => setVetCost(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowVetModal(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Save Medical Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Breeding Modal */}
      {showBreedingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-neutral-900">Record Breeding / Artificial Insemination (AI)</h3>

            <form onSubmit={handleCreateBreedingRecord} className="space-y-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Select Animal *</label>
                <select
                  value={breedAnimalId}
                  onChange={(e) => setBreedAnimalId(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                >
                  {branchAnimals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.earTag}) — {a.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Event Type</label>
                <select
                  value={breedEvent}
                  onChange={(e) => setBreedEvent(e.target.value as any)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="artificial_insemination">Artificial Insemination (AI Service)</option>
                  <option value="pd_check">Pregnancy Diagnosis (PD Check)</option>
                  <option value="calving">Calving Event</option>
                </select>
              </div>

              {breedEvent === 'artificial_insemination' && (
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Semen Straw ID / Sire</label>
                  <input
                    type="text"
                    value={semenStraw}
                    onChange={(e) => setSemenStraw(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    * Automated gestation calculation will set expected calving date (~283 days for cows, ~310 days for buffaloes).
                  </p>
                </div>
              )}

              {breedEvent === 'pd_check' && (
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">PD Result</label>
                  <select
                    value={pdResult}
                    onChange={(e) => setPdResult(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-bold"
                  >
                    <option value="pregnant">Confirmed Pregnant (گابھن)</option>
                    <option value="non_pregnant">Empty / Non-Pregnant (خالی)</option>
                    <option value="recheck">Re-check in 2 weeks</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Technician / Veterinarian</label>
                <input
                  type="text"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowBreedingModal(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
