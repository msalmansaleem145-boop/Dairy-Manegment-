import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  CheckCircle2 
} from 'lucide-react';
import { AppDatabase } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface ReportsViewProps {
  db: AppDatabase;
  lang: Language;
  selectedBranchId: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  db,
  lang,
  selectedBranchId
}) => {
  const t = translations[lang];

  const [reportType, setReportType] = useState<'milk' | 'sales' | 'credit' | 'feed' | 'pnl'>('milk');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportedMsg, setExportedMsg] = useState('');

  // Helper to trigger CSV download
  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedMsg(`Successfully exported ${filename}!`);
    setTimeout(() => setExportedMsg(''), 3000);
  };

  const handleExport = () => {
    if (reportType === 'milk') {
      const rows: (string | number)[][] = [
        ['Date', 'Shift', 'Animal_ID', 'Ear_Tag', 'Quantity_Litres', 'Fat_Pct', 'SNF_Pct', 'Quality']
      ];
      db.milkRecords.forEach(r => {
        const animal = db.animals.find(a => a.id === r.animalId);
        rows.push([
          r.date,
          r.shift,
          r.animalId,
          animal?.earTag || '',
          r.quantityLitres,
          r.fatPercentage,
          r.snfPercentage,
          r.qualityStatus
        ]);
      });
      downloadCSV(`ASK_Dairy_Milk_Production_${startDate}_to_${endDate}.csv`, rows);
    } else if (reportType === 'sales') {
      const rows: (string | number)[][] = [
        ['Invoice_Number', 'Date', 'Customer_Name', 'Subtotal', 'Discount', 'Total_PKR', 'Paid_Amount', 'Credit_Amount', 'Payment_Method']
      ];
      db.sales.forEach(s => {
        rows.push([
          s.invoiceNumber,
          s.date,
          `"${s.customerName}"`,
          s.subtotal,
          s.discount,
          s.total,
          s.paidAmount,
          s.creditAmount,
          s.paymentMethod
        ]);
      });
      downloadCSV(`ASK_Dairy_Sales_Invoices_${startDate}_to_${endDate}.csv`, rows);
    } else if (reportType === 'credit') {
      const rows: (string | number)[][] = [
        ['Customer_ID', 'Customer_Name', 'Phone', 'Category', 'Credit_Limit', 'Outstanding_Balance_PKR']
      ];
      db.customers.forEach(c => {
        rows.push([
          c.id,
          `"${c.name}"`,
          c.phone,
          c.category,
          c.creditLimit,
          c.balance
        ]);
      });
      downloadCSV(`ASK_Dairy_Customer_Credit_Aging.csv`, rows);
    } else if (reportType === 'feed') {
      const rows: (string | number)[][] = [
        ['Date', 'Feed_Plan', 'Milking_Animals_Count', 'Total_Kg_Consumed', 'Total_Cost_PKR']
      ];
      db.feedConsumptions.forEach(f => {
        rows.push([
          f.date,
          `"${f.feedPlanName}"`,
          f.animalCount,
          f.totalKg,
          f.totalCost
        ]);
      });
      downloadCSV(`ASK_Dairy_Feed_Consumption_Costs.csv`, rows);
    } else if (reportType === 'pnl') {
      const rows: (string | number)[][] = [
        ['Account_Code', 'Account_Title', 'Type', 'Balance_PKR']
      ];
      db.accounts.forEach(a => {
        rows.push([
          a.code,
          `"${a.name}"`,
          a.type,
          a.balance
        ]);
      });
      downloadCSV(`ASK_Dairy_Financial_Trial_Balance.csv`, rows);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.reports}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Operational summaries, milk yield analytics, credit aging & financial exports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV / Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report View</span>
          </button>
        </div>
      </div>

      {exportedMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{exportedMsg}</span>
        </div>
      )}

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Report Type Selector */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setReportType('milk')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              reportType === 'milk' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Milk Production
          </button>
          <button
            onClick={() => setReportType('sales')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              reportType === 'sales' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Sales & POS
          </button>
          <button
            onClick={() => setReportType('credit')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              reportType === 'credit' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Customer Credit Aging
          </button>
          <button
            onClick={() => setReportType('feed')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              reportType === 'feed' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Feed Efficiency
          </button>
          <button
            onClick={() => setReportType('pnl')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              reportType === 'pnl' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            P&L Accounts
          </button>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 font-medium">Period:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-1 border border-neutral-300 rounded text-xs"
          />
          <span className="text-neutral-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-1 border border-neutral-300 rounded text-xs"
          />
        </div>
      </div>

      {/* Rendered Report Preview Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 font-bold text-xs text-neutral-900">
          Report Preview — {reportType.toUpperCase()} ({startDate} to {endDate})
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          {reportType === 'milk' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Shift</th>
                  <th className="py-2.5 px-3">Cow / Tag</th>
                  <th className="py-2.5 px-3 text-right">Yield (L)</th>
                  <th className="py-2.5 px-3 text-right">Fat %</th>
                  <th className="py-2.5 px-3 text-right">SNF %</th>
                  <th className="py-2.5 px-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {db.milkRecords.map(r => (
                  <tr key={r.id}>
                    <td className="py-2 px-3 font-mono">{r.date}</td>
                    <td className="py-2 px-3 capitalize">{r.shift}</td>
                    <td className="py-2 px-3 font-semibold">{r.animalId}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold">{r.quantityLitres.toFixed(1)} L</td>
                    <td className="py-2 px-3 text-right tabular-nums">{r.fatPercentage.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right tabular-nums">{r.snfPercentage.toFixed(1)}%</td>
                    <td className="py-2 px-3 uppercase text-[10px] text-emerald-800">{r.qualityStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'sales' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-right">Total (₨)</th>
                  <th className="py-2.5 px-3 text-right">Cash Paid</th>
                  <th className="py-2.5 px-3 text-right">Credit Balance</th>
                  <th className="py-2.5 px-3">Payment Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {db.sales.map(s => (
                  <tr key={s.id}>
                    <td className="py-2 px-3 font-mono font-semibold">{s.invoiceNumber}</td>
                    <td className="py-2 px-3">{s.date}</td>
                    <td className="py-2 px-3 font-medium">{s.customerName}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold">₨ {s.total.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right tabular-nums">₨ {s.paidAmount.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-amber-800">
                      {s.creditAmount > 0 ? `₨ ${s.creditAmount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-2 px-3 capitalize text-[11px]">{s.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'credit' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3 text-right">Credit Limit</th>
                  <th className="py-2.5 px-3 text-right">Current Balance (₨)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {db.customers.map(c => (
                  <tr key={c.id}>
                    <td className="py-2 px-3 font-bold text-neutral-900">{c.name}</td>
                    <td className="py-2 px-3 capitalize">{c.category.replace('_', ' ')}</td>
                    <td className="py-2 px-3 font-mono">{c.phone}</td>
                    <td className="py-2 px-3 text-right tabular-nums">₨ {c.creditLimit.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-emerald-950">
                      ₨ {c.balance.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        c.balance > c.creditLimit ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {c.balance > c.creditLimit ? 'Over Limit' : 'Good Standing'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'feed' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Ration Plan</th>
                  <th className="py-2.5 px-3 text-right">Herd Count</th>
                  <th className="py-2.5 px-3 text-right">Total Kg Fed</th>
                  <th className="py-2.5 px-3 text-right">Feed Cost (₨)</th>
                  <th className="py-2.5 px-3">Feeder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {db.feedConsumptions.map(f => (
                  <tr key={f.id}>
                    <td className="py-2 px-3 font-mono">{f.date}</td>
                    <td className="py-2 px-3 font-medium">{f.feedPlanName}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold">{f.animalCount} animals</td>
                    <td className="py-2 px-3 text-right tabular-nums">{f.totalKg} Kg</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-neutral-900">
                      ₨ {f.totalCost.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-neutral-600">{f.operatorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'pnl' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Account Title</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3 text-right">Balance (₨)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {db.accounts.map(a => (
                  <tr key={a.id}>
                    <td className="py-2 px-3 font-mono font-bold">{a.code}</td>
                    <td className="py-2 px-3 font-semibold">{a.name}</td>
                    <td className="py-2 px-3 uppercase text-[11px] text-neutral-600">{a.type}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-neutral-900">
                      ₨ {a.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
