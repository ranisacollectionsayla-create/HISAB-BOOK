import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { getTodayYYYYMMDD, formatINR } from '../../utils/formatters';
import { calculateEmployeeAdvanceBalance } from '../../utils/salaryCalculator';
import { X, HandCoins, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  initialEmployeeId?: string;
}

export const AddAdvanceModal: React.FC<Props> = ({ onClose, initialEmployeeId }) => {
  const { state, addAdvance } = usePayroll();

  const [employeeId, setEmployeeId] = useState<string>(
    initialEmployeeId || (state.employees[0]?.id || '')
  );
  const [date, setDate] = useState<string>(getTodayYYYYMMDD());
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const currentEmp = state.employees.find((e) => e.id === employeeId);
  const advanceStats = currentEmp
    ? calculateEmployeeAdvanceBalance(currentEmp.id, state.advances, state.adjustments)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError('कृपया कर्मचारी चुनें (Select Employee)');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('कृपया सही पेशगी राशि दर्ज करें (Enter valid advance amount)');
      return;
    }

    addAdvance({
      employeeId,
      date,
      amount: numAmount,
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
            <HandCoins className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-lg">पेशगी / एडवांस दें (Give Advance)</h3>
              <p className="text-xs text-slate-300">कर्मचारी को दी गई अग्रिम राशि दर्ज करें</p>
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
                  {emp.name} {emp.fatherName ? `(${emp.fatherName})` : ''} - ₹{emp.salaryAmount}
                </option>
              ))}
            </select>
          </div>

          {/* Advance Balance Status info */}
          {advanceStats && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-600">पहले से बकाया पेशगी:</span>
                <div className="text-sm font-bold text-amber-900">
                  {formatINR(advanceStats.remainingBalance)}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <span>कुल दी गई: {formatINR(advanceStats.totalGiven)}</span>
                <br />
                <span>वसूल हुई: {formatINR(advanceStats.totalRecovered)}</span>
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date <span className="text-red-500">*</span>
              <span className="text-slate-400 font-normal ml-1">(पेशगी देने की तारीख)</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Advance Amount <span className="text-red-500">*</span>
              <span className="text-slate-400 font-normal ml-1">(पेशगी राशि ₹)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="उदा. 2000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-extrabold text-lg text-slate-900"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Note
              <span className="text-slate-400 font-normal ml-1">(कारण / टिप्पणी)</span>
            </label>
            <input
              type="text"
              placeholder="उदा. घर खर्च, बच्चे की स्कूल फीस, दवाई आदि"
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
              className="px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition"
            >
              पेशगी सेव करें (Save Advance)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
