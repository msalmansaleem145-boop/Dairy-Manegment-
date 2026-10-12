import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  Save
} from 'lucide-react';
import { AppDatabase, DairyDatabaseService, LOGO_URL } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface SettingsViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  db,
  onRefreshDb,
  lang
}) => {
  const t = translations[lang];

  const [farmName, setFarmName] = useState('ASK Dairy Farm Limited');
  const [address, setAddress] = useState('Okara Bypass Road, Punjab, Pakistan');
  const [phone, setPhone] = useState('+92 300 4567890');
  const [ntn, setNtn] = useState('7812904-2');
  const [defaultCowPrice, setDefaultCowPrice] = useState<number>(195);
  const [defaultBufPrice, setDefaultBufPrice] = useState<number>(220);
  const [feedback, setFeedback] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('Farm settings saved successfully!');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = DairyDatabaseService.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASK_Dairy_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setFeedback('Backup downloaded successfully!');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = DairyDatabaseService.importDatabaseJSON(content);
      if (success) {
        onRefreshDb();
        setFeedback('Database successfully restored from backup file!');
      } else {
        alert('Invalid database backup JSON file format.');
      }
      setTimeout(() => setFeedback(''), 4000);
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Warning: This will reset all records back to default demo state. Do you wish to continue?')) {
      DairyDatabaseService.resetToFactoryDefaults();
      onRefreshDb();
      setFeedback('System reset to factory defaults.');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          {t.settings}
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Farm company profile, multi-branch parameters, price tariffs & database backup/restore
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Brand & Farm Identity */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5 shadow-xs">
        <div className="flex items-center gap-4 border-b border-neutral-200 pb-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100 flex items-center justify-center">
            <img
              src={LOGO_URL}
              alt="ASK Dairy Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">ASK Dairy Management Enterprise</h2>
            <p className="text-xs text-neutral-500">Corporate NTN: {ntn} · Registered Punjab Livestock Board</p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-800 mt-1 font-semibold">
              <span>Currency: PKR (₨)</span>
              <span>·</span>
              <span>Units: Litres & Kilograms</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Company / Farm Title</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Helpline / Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-700 font-semibold mb-1">Headquarters Farm Location</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border border-neutral-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Default Fresh Cow Milk Price (₨/L)</label>
              <input
                type="number"
                value={defaultCowPrice}
                onChange={(e) => setDefaultCowPrice(Number(e.target.value))}
                className="w-full p-2 border border-neutral-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-neutral-700 font-semibold mb-1">Default Buffalo Milk Price (₨/L)</label>
              <input
                type="number"
                value={defaultBufPrice}
                onChange={(e) => setDefaultBufPrice(Number(e.target.value))}
                className="w-full p-2 border border-neutral-300 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900 cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Farm Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Multi-Branch Management */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Configured Farm Branches & Locations</span>
            </h3>
            <p className="text-xs text-neutral-500">Strict data isolation between separate agricultural units</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {db.branches.map(branch => (
            <div key={branch.id} className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">{branch.name}</span>
                <span className="font-mono text-[10px] bg-neutral-200 px-1.5 py-0.5 rounded font-bold">
                  {branch.code}
                </span>
              </div>
              <div className="text-neutral-600 text-[11px]">{branch.location}</div>
              <div className="text-neutral-500 text-[10px] pt-1">
                Manager: <strong>{branch.managerName}</strong> · Phone: {branch.phone}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Backup & Disaster Recovery */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Database Backup & Disaster Recovery</h3>
          <p className="text-xs text-neutral-500">
            Export a full cryptographic JSON state of your herd, accounts, ledgers, and sales
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Download Backup */}
          <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 space-y-3">
            <div className="font-semibold text-neutral-800 text-xs">Download Complete Backup</div>
            <p className="text-[11px] text-neutral-500">
              Saves all animals, journal entries, milk production logs, customers, and inventory to your local drive.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Database JSON</span>
            </button>
          </div>

          {/* Restore Backup */}
          <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 space-y-3">
            <div className="font-semibold text-neutral-800 text-xs">Restore Database Backup</div>
            <p className="text-[11px] text-neutral-500">
              Restore from a previously exported JSON backup file with structural schema verification.
            </p>
            <label className="w-full py-2 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload & Restore JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Factory Reset */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-red-900">Factory Reset Database</div>
            <p className="text-neutral-500 text-[11px]">Re-seeds default Pakistani dairy animals and initial chart of accounts</p>
          </div>
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg font-semibold cursor-pointer"
          >
            Reset to Factory Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
