import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Employee, SalaryType } from '../../types';
import { getTodayYYYYMMDD } from '../../utils/formatters';
import { X, UserPlus, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  employeeToEdit?: Employee | null;
}

export const AddEmployeeModal: React.FC<Props> = ({ onClose, employeeToEdit }) => {
  const { addEmployee, updateEmployee } = usePayroll();

  const [name, setName] = useState(employeeToEdit?.name || '');
  const [fatherName, setFatherName] = useState(employeeToEdit?.fatherName || '');
  const [mobileNumber, setMobileNumber] = useState(employeeToEdit?.mobileNumber || '');
  const [village, setVillage] = useState(employeeToEdit?.village || '');
  const [joiningDate, setJoiningDate] = useState(employeeToEdit?.joiningDate || getTodayYYYYMMDD());
  const [salaryType, setSalaryType] = useState<SalaryType>(employeeToEdit?.salaryType || 'monthly');
  const [salaryAmount, setSalaryAmount] = useState<string>(
    employeeToEdit ? String(employeeToEdit.salaryAmount) : ''
  );
  const [commissionEnabled, setCommissionEnabled] = useState<boolean>(
    employeeToEdit?.commissionEnabled ?? false
  );
  const [commissionPercentage, setCommissionPercentage] = useState<string>(
    employeeToEdit ? String(employeeToEdit.commissionPercentage) : '1.0'
  );
  const [notes, setNotes] = useState(employeeToEdit?.notes || '');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया कर्मचारी का नाम दर्ज करें (Employee Name is required)');
      return;
    }
    const numSalary = parseFloat(salaryAmount);
    if (isNaN(numSalary) || numSalary <= 0) {
      setError('कृपया सही वेतन राशि दर्ज करें (Enter valid salary amount)');
      return;
    }

    const numCommission = commissionEnabled ? parseFloat(commissionPercentage) || 0 : 0;

    if (employeeToEdit) {
      updateEmployee(employeeToEdit.id, {
        name: name.trim(),
        fatherName: fatherName.trim(),
        mobileNumber: mobileNumber.trim(),
        village: village.trim(),
        joiningDate,
        salaryType,
        salaryAmount: numSalary,
        commissionEnabled,
        commissionPercentage: numCommission,
        notes: notes.trim(),
      });
    } else {
      addEmployee({
        name: name.trim(),
        fatherName: fatherName.trim(),
        mobileNumber: mobileNumber.trim(),
        village: village.trim(),
        joiningDate,
        salaryType,
        salaryAmount: numSalary,
        commissionEnabled,
        commissionPercentage: numCommission,
        status: 'active',
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-lg">
              {employeeToEdit ? 'कर्मचारी विवरण बदलें (Edit Employee)' : 'नया कर्मचारी जोड़ें (Add Employee)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee Name <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(कर्मचारी का नाम)</span>
              </label>
              <input
                type="text"
                required
                placeholder="उदा. Mahendra Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
              />
            </div>

            {/* Father Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Father Name
                <span className="text-slate-400 font-normal ml-1">(पिता का नाम)</span>
              </label>
              <input
                type="text"
                placeholder="उदा. Bhanwar Singh"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number
                <span className="text-slate-400 font-normal ml-1">(मोबाइल नंबर)</span>
              </label>
              <input
                type="tel"
                placeholder="10 अंकों का नंबर"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
              />
            </div>

            {/* Village / City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Village / City
                <span className="text-slate-400 font-normal ml-1">(गाँव / शहर)</span>
              </label>
              <input
                type="text"
                placeholder="उदा. Sayla / Jalore"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Joining Date
                <span className="text-slate-400 font-normal ml-1">(शामिल होने की तारीख)</span>
              </label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
              />
            </div>

            {/* Salary Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salary Type <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(वेतन प्रकार)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSalaryType('monthly')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition ${
                    salaryType === 'monthly'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-200'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Monthly (मासिक)
                </button>
                <button
                  type="button"
                  onClick={() => setSalaryType('daily')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition ${
                    salaryType === 'daily'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-200'
                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Daily (दैनिक दिहाड़ी)
                </button>
              </div>
            </div>

            {/* Salary Amount */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {salaryType === 'monthly' ? 'Monthly Salary Amount (मासिक वेतन)' : 'Daily Rate Amount (दैनिक दर)'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder={salaryType === 'monthly' ? 'उदा. 15000' : 'उदा. 500'}
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Commission Toggle */}
            <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Sales Commission (बिक्री पर कमीशन)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    कपड़े की दुकान में बिक्री पर कर्मचारी को कमीशन देना है?
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={commissionEnabled}
                    onChange={(e) => setCommissionEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              {commissionEnabled && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    Commission Percentage (% दर):
                  </label>
                  <div className="relative w-32">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={commissionPercentage}
                      onChange={(e) => setCommissionPercentage(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-center font-bold"
                    />
                    <span className="absolute right-3 top-1.5 text-slate-400 font-bold">%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Note/Role */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role / Notes
                <span className="text-slate-400 font-normal ml-1">(कार्य का प्रकार / टिप्पणी)</span>
              </label>
              <input
                type="text"
                placeholder="उदा. Counter Sales, Master Tailor, Helper, Packing"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition"
            >
              {employeeToEdit ? 'अपडेट करें (Update)' : 'सेव करें (Save Employee)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
