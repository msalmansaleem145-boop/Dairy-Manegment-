import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Phone, 
  DollarSign, 
  CheckCircle2, 
  X,
  CreditCard
} from 'lucide-react';
import { Employee, PayrollRecord } from '../types';
import { AppDatabase, DairyDatabaseService } from '../services/storage';
import { Language, translations } from '../i18n/translations';

interface EmployeesViewProps {
  db: AppDatabase;
  onRefreshDb: () => void;
  lang: Language;
  selectedBranchId: string;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  db,
  onRefreshDb,
  lang,
  selectedBranchId
}) => {
  const t = translations[lang];

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empCnic, setEmpCnic] = useState('');
  const [empRole, setEmpRole] = useState('Farm Laborer');
  const [empSalary, setEmpSalary] = useState<number>(35000);

  // Disburse Payroll State
  const [selectedEmpId, setSelectedEmpId] = useState(db.employees[0]?.id || '');
  const [disburseMonth, setDisburseMonth] = useState('2026-10');
  const [allowance, setAllowance] = useState<number>(3000);
  const [deductions, setDeductions] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [successMsg, setSuccessMsg] = useState('');

  const branchEmployees = db.employees.filter(e => e.branchId === selectedBranchId || true);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;

    const currentDb = DairyDatabaseService.getDatabase();
    currentDb.employees.unshift({
      id: `EMP-${Date.now().toString().slice(-4)}`,
      name: empName.trim(),
      phone: empPhone.trim(),
      cnic: empCnic.trim(),
      role: empRole,
      branchId: selectedBranchId,
      joinDate: new Date().toISOString().split('T')[0],
      salaryType: 'monthly',
      baseSalary: Number(empSalary),
      status: 'active'
    });

    DairyDatabaseService.saveDatabase(currentDb);
    onRefreshDb();
    setShowAddModal(false);
    setSuccessMsg(`Employee ${empName} registered successfully!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDisburseSalary = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = db.employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    const net = emp.baseSalary + allowance - deductions;

    const record: PayrollRecord = {
      id: `PAY-${disburseMonth}-${emp.id}`,
      monthYear: disburseMonth,
      employeeId: emp.id,
      employeeName: emp.name,
      baseSalary: emp.baseSalary,
      allowances: allowance,
      advancesDeducted: deductions,
      netPayable: net,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      status: 'paid'
    };

    const currentDb = DairyDatabaseService.getDatabase();
    currentDb.payroll.unshift(record);
    DairyDatabaseService.saveDatabase(currentDb);

    // Post to double entry accounts: Debit Labor Expense, Credit Cash/Bank
    const creditAcc = paymentMethod === 'cash' ? 'ACC-1010' : 'ACC-1020';
    const creditName = paymentMethod === 'cash' ? 'Cash in Register' : 'Meezan Bank - Main Operations';

    DairyDatabaseService.postJournalEntry({
      id: `JRN-PAY-${Date.now()}`,
      entryNumber: `PAY-VOUCH-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      branchId: selectedBranchId,
      description: `Payroll Salary Disbursement for ${emp.name} (${disburseMonth})`,
      referenceType: 'payroll',
      createdBy: 'Accountant',
      lines: [
        { accountId: 'ACC-5030', accountName: 'Farm Labor & Staff Salaries', accountCode: '5030', debit: net, credit: 0 },
        { accountId: creditAcc, accountName: creditName, accountCode: creditAcc.replace('ACC-', ''), debit: 0, credit: net }
      ]
    });

    onRefreshDb();
    setShowPayrollModal(false);
    setSuccessMsg(`Paid salary of ₨ ${net.toLocaleString()} to ${emp.name}. Journal entry posted!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            {t.employees}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Farm laborers, milkmen, veterinarians, salary disbursements & payroll vouchers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPayrollModal(true)}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Disburse Monthly Payroll</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Employee</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Staff Roster */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 font-bold text-xs text-neutral-900">
          Farm Personnel Directory
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Name & ID</th>
                <th className="py-2.5 px-3">Role Designation</th>
                <th className="py-2.5 px-3">CNIC & Phone</th>
                <th className="py-2.5 px-3 text-right">Base Salary (₨)</th>
                <th className="py-2.5 px-3">Join Date</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {branchEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-neutral-900">{emp.name}</div>
                    <div className="text-[11px] font-mono text-neutral-400">{emp.id}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-neutral-800">{emp.role}</td>
                  <td className="py-2.5 px-3">
                    <div className="text-neutral-900 font-medium">{emp.phone}</div>
                    <div className="text-[11px] font-mono text-neutral-500">{emp.cnic}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-neutral-900">
                    ₨ {emp.baseSalary.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600 font-mono text-[11px]">{emp.joinDate}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] uppercase">
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll History */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 font-bold text-xs text-neutral-900">
          Recent Salary Disbursement Vouchers
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3 text-right">Base Salary</th>
                <th className="py-2.5 px-3 text-right">Incentives</th>
                <th className="py-2.5 px-3 text-right">Deductions</th>
                <th className="py-2.5 px-3 text-right">Net Paid (₨)</th>
                <th className="py-2.5 px-3">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {db.payroll.map(pay => (
                <tr key={pay.id} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3 font-semibold text-neutral-900 font-mono">{pay.monthYear}</td>
                  <td className="py-2.5 px-3 font-medium text-neutral-800">{pay.employeeName}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">₨ {pay.baseSalary.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-emerald-800">+ ₨ {pay.allowances.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-red-700">- ₨ {pay.advancesDeducted.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-neutral-900">₨ {pay.netPayable.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px]">{pay.paidDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse Payroll Modal */}
      {showPayrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-neutral-900">Disburse Salary Voucher</h3>

            <form onSubmit={handleDisburseSalary} className="space-y-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Employee *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                >
                  {branchEmployees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.role} (Base: ₨ {e.baseSalary.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Payroll Month</label>
                  <input
                    type="month"
                    value={disburseMonth}
                    onChange={(e) => setDisburseMonth(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="cash">Cash in Hand</option>
                    <option value="bank_transfer">Meezan Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Allowances / Bonus (₨)</label>
                  <input
                    type="number"
                    value={allowance}
                    onChange={(e) => setAllowance(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Advance Deductions (₨)</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-neutral-500 text-[11px]">Net Disbursed Amount:</span>
                <div className="text-base font-bold text-emerald-900 tabular-nums">
                  ₨ {((db.employees.find(e => e.id === selectedEmpId)?.baseSalary || 35000) + allowance - deductions).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowPayrollModal(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Confirm & Post Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-neutral-900">Register New Farm Staff</h3>

            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+92 300..."
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">CNIC #</label>
                  <input
                    type="text"
                    placeholder="35302-..."
                    value={empCnic}
                    onChange={(e) => setEmpCnic(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Role Designation</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="Farm Laborer / Feeder">Farm Laborer / Feeder</option>
                    <option value="Lead Milkman">Lead Milkman</option>
                    <option value="POS Cashier">POS Cashier</option>
                    <option value="Dairy Processing Specialist">Dairy Processing Specialist</option>
                    <option value="Veterinary Assistant">Veterinary Assistant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Monthly Salary (₨)</label>
                  <input
                    type="number"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
