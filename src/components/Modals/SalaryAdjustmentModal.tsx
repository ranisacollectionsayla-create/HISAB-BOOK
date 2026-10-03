import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { formatINR, getMonthLabel } from '../../utils/formatters';
import { calculateEmployeeAdvanceBalance } from '../../utils/salaryCalculator';
import { X, Sliders, AlertCircle, Info } from 'lucide-react';

interface Props {
  onClose: () => void;
  employeeId: string;
  month: string;
}

export const SalaryAdjustmentModal: React.FC<Props> = ({ onClose, employeeId, month }) => {
  const { state, saveAdjustment } = usePayroll();

  const employee = state.employees.find((e) => e.id === employeeId);
  const existingAdj = state.adjustments.find(
    (a) => a.employeeId === employeeId && a.month === month
  );

  const advanceStats = employee
    ? calculateEmployeeAdvanceBalance(employee.id, state.advances, state.adjustments)
    : null;

  // If already deducted in existing adjustment, we add it back to show how much is un-recovered
  const availableAdvance = (advanceStats?.remainingBalance || 0) + (existingAdj?.advanceDeducted || 0);

  const [adjustmentAmount, setAdjustmentAmount] = useState<string>(
    existingAdj ? String(existingAdj.adjustmentAmount) : '0'
  );
  const [advanceDeducted, setAdvanceDeducted] = useState<string>(
    existingAdj ? String(existingAdj.advanceDeducted) : String(Math.min(availableAdvance, 0))
  );
  const [reason, setReason] = useState<string>(existingAdj?.reason || '');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAdj = parseFloat(adjustmentAmount) || 0;
    const numAdvDed = parseFloat(advanceDeducted) || 0;

    if (numAdvDed < 0) {
      setError('एडवांस कटौती ऋणात्मक नहीं हो सकती (Advance deduction cannot be negative)');
      return;
    }

    saveAdjustment({
      employeeId,
      month,
      adjustmentAmount: numAdj,
      advanceDeducted: numAdvDed,
      reason: reason.trim(),
    });

    onClose();
  };

  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-lg">वेतन एडजस्टमेंट (Salary Adjustment)</h3>
              <p className="text-xs text-slate-300">
                {employee.name} • {getMonthLabel(month)}
              </p>
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

          {/* Advance Deduction Section */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-900">
                इस महीने पेशगी कटौती (Advance Recovery):
              </span>
              <span className="text-slate-600">
                कुल बकाया पेशगी: <strong>{formatINR(availableAdvance)}</strong>
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={advanceDeducted}
                onChange={(e) => setAdvanceDeducted(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-amber-300 bg-white rounded-lg font-bold text-amber-900"
              />
            </div>
            {availableAdvance > 0 && (
              <div className="flex justify-end gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAdvanceDeducted(String(availableAdvance))}
                  className="text-amber-800 font-semibold hover:underline"
                >
                  पूरी पेशगी काटें ({formatINR(availableAdvance)})
                </button>
                <button
                  type="button"
                  onClick={() => setAdvanceDeducted('0')}
                  className="text-slate-500 hover:underline"
                >
                  कटौती न करें (₹0)
                </button>
              </div>
            )}
          </div>

          {/* Other Adjustments (+ Bonus or - Penalty) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Other Adjustment (अन्य बोनस / कटौती ₹)
            </label>
            <p className="text-[11px] text-slate-500 mb-1">
              बोनस जोड़ने के लिए धनात्मक (+500) या अन्य कटौती के लिए ऋणात्मक (-200) लिखें।
            </p>
            <div className="relative">
              <input
                type="number"
                step="1"
                placeholder="0"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Remarks (कारण)
            </label>
            <input
              type="text"
              placeholder="उदा. दिवाली बोनस, दुकान नुकसान भरपाई, पेशगी कटौती"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition"
            >
              एडजस्टमेंट सेव करें (Save)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
