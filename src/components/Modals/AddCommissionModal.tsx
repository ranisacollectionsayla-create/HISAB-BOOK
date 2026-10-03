import React, { useState, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { getTodayYYYYMMDD, formatINR } from '../../utils/formatters';
import { X, TrendingUp, AlertCircle, Percent } from 'lucide-react';

interface Props {
  onClose: () => void;
  initialEmployeeId?: string;
}

export const AddCommissionModal: React.FC<Props> = ({ onClose, initialEmployeeId }) => {
  const { state, addCommission } = usePayroll();

  const [employeeId, setEmployeeId] = useState<string>(
    initialEmployeeId || (state.employees[0]?.id || '')
  );
  const [date, setDate] = useState<string>(getTodayYYYYMMDD());
  const [salesAmount, setSalesAmount] = useState<string>('');
  const [commissionType, setCommissionType] = useState<'daily' | 'monthly'>('daily');

  // Find employee commission % if configured
  const selectedEmp = state.employees.find((e) => e.id === employeeId);
  const [commissionPercentage, setCommissionPercentage] = useState<string>(
    selectedEmp ? String(selectedEmp.commissionPercentage || 1) : '1'
  );
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (selectedEmp && selectedEmp.commissionPercentage) {
      setCommissionPercentage(String(selectedEmp.commissionPercentage));
    }
  }, [employeeId]);

  // Auto calculate commission amount: Sales * % / 100
  const salesNum = parseFloat(salesAmount) || 0;
  const commPercentNum = parseFloat(commissionPercentage) || 0;
  const calculatedCommission = Math.round((salesNum * commPercentNum) / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError('कृपया कर्मचारी चुनें (Select Employee)');
      return;
    }
    if (salesNum <= 0) {
      setError('कृपया सही बिक्री राशि दर्ज करें (Enter valid sales amount)');
      return;
    }

    addCommission({
      employeeId,
      date,
      salesAmount: salesNum,
      commissionPercentage: commPercentNum,
      commissionAmount: calculatedCommission,
      type: commissionType,
      note: note.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-lg">बिक्री कमीशन जोड़ें (Add Commission)</h3>
              <p className="text-xs text-slate-300">दुकान की बिक्री पर कर्मचारी का कमीशन</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Employee <span className="text-red-500">*</span>
              <span className="text-slate-400 font-normal ml-1">(कर्मचारी चुनें)</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm font-semibold"
            >
              {state.employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.fatherName ? `(${emp.fatherName})` : ''} -{' '}
                  {emp.commissionEnabled ? `कमीशन लागू (${emp.commissionPercentage}%)` : 'कमीशन बंद'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(तारीख)</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Basis <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(आधार)</span>
              </label>
              <select
                value={commissionType}
                onChange={(e) => setCommissionType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
              >
                <option value="daily">Daily Sales (दैनिक बिक्री)</option>
                <option value="monthly">Monthly Sales (मासिक बिक्री)</option>
              </select>
            </div>
          </div>

          {/* Sales Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sales Amount (बिक्री राशि) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="उदा. 50000"
                value={salesAmount}
                onChange={(e) => setSalesAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold text-base text-slate-900"
              />
            </div>
          </div>

          {/* Commission % */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Commission Percentage (कमीशन दर %) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                placeholder="उदा. 1.0"
                value={commissionPercentage}
                onChange={(e) => setCommissionPercentage(e.target.value)}
                className="w-full pr-8 pl-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold text-base text-slate-900"
              />
              <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Calculated commission callout */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex justify-between items-center">
            <div>
              <span className="text-xs text-indigo-700 font-medium">बनने वाला कमीशन (Commission Amount):</span>
              <div className="text-xl font-extrabold text-indigo-900">
                {formatINR(calculatedCommission)}
              </div>
            </div>
            <div className="text-[11px] text-indigo-600 bg-white px-2 py-1 rounded-md border border-indigo-200">
              {formatINR(salesNum)} × {commPercentNum}%
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sale Details / Note
              <span className="text-slate-400 font-normal ml-1">(बिक्री विवरण / टिप्पणी)</span>
            </label>
            <input
              type="text"
              placeholder="उदा. शादी की पोशाक, साड़ियाँ, लहंगा बिक्री"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
            >
              कमीशन सेव करें (Save Commission)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
