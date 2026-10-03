import React, { useState, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { PaymentMode } from '../../types';
import { getTodayYYYYMMDD, formatINR, getMonthLabel } from '../../utils/formatters';
import { calculateEmployeeMonthlySummary } from '../../utils/salaryCalculator';
import { X, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  initialEmployeeId?: string;
  initialMonth?: string;
}

export const SalaryPaymentModal: React.FC<Props> = ({
  onClose,
  initialEmployeeId,
  initialMonth,
}) => {
  const { state, addPayment, selectedMonth, setSelectedPaymentVoucher } = usePayroll();

  const [employeeId, setEmployeeId] = useState<string>(
    initialEmployeeId || (state.employees[0]?.id || '')
  );
  const [salaryMonth, setSalaryMonth] = useState<string>(initialMonth || selectedMonth);
  const [paymentDate, setPaymentDate] = useState<string>(getTodayYYYYMMDD());
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Calculate current month's salary details for selected employee
  const selectedEmp = state.employees.find((e) => e.id === employeeId);
  const summary = selectedEmp
    ? calculateEmployeeMonthlySummary(
        selectedEmp,
        salaryMonth,
        state.attendance,
        state.advances,
        state.commissions,
        state.payments,
        state.adjustments,
        state.settings
      )
    : null;

  // Auto-fill full remaining balance if amount is empty
  useEffect(() => {
    if (summary && !amountPaid && summary.balanceDue > 0) {
      setAmountPaid(String(summary.balanceDue));
    }
  }, [employeeId, salaryMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError('कृपया कर्मचारी चुनें (Select Employee)');
      return;
    }
    const numAmount = parseFloat(amountPaid);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('कृपया सही भुगतान राशि दर्ज करें (Enter valid amount)');
      return;
    }

    const savedPayment = addPayment({
      employeeId,
      salaryMonth,
      paymentDate,
      amountPaid: numAmount,
      paymentMode,
      note: note.trim(),
    });

    // Option to view/print payment receipt voucher
    setSelectedPaymentVoucher(savedPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-lg">वेतन भुगतान (Salary Payment)</h3>
              <p className="text-xs text-slate-300">कर्मचारी को वेतन का भुगतान दर्ज करें</p>
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

          {/* Employee Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Employee <span className="text-red-500">*</span>
              <span className="text-slate-400 font-normal ml-1">(कर्मचारी चुनें)</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setAmountPaid('');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm font-semibold"
            >
              {state.employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.fatherName ? `(${emp.fatherName})` : ''} - ₹{emp.salaryAmount}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Salary Month */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salary Month <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(वेतन माह)</span>
              </label>
              <input
                type="month"
                required
                value={salaryMonth}
                onChange={(e) => {
                  setSalaryMonth(e.target.value);
                  setAmountPaid('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Date <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(भुगतान तारीख)</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          {/* Month Status Card (Net Salary, Already Paid, Balance Due) */}
          {summary && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>महीना: <strong className="text-slate-900">{getMonthLabel(salaryMonth)}</strong></span>
                <span>कुल उपस्थित दिन: <strong>{summary.payableDays}</strong></span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 text-center">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">कुल वेतन (Net)</div>
                  <div className="text-sm font-bold text-slate-800">{formatINR(summary.netSalary)}</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">चुकाया गया (Paid)</div>
                  <div className="text-sm font-bold text-emerald-700">{formatINR(summary.totalPaid)}</div>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="text-[10px] text-rose-600 font-medium">बाकी (Balance Due)</div>
                  <div className="text-sm font-extrabold text-rose-700">{formatINR(summary.balanceDue)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Amount Paid */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Amount Paid <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(भुगतान राशि)</span>
              </label>
              {summary && summary.balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountPaid(String(summary.balanceDue))}
                  className="text-[11px] text-rose-600 font-bold hover:underline"
                >
                  पूरा बाकी भरें ({formatINR(summary.balanceDue)})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="उदा. 5000"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-extrabold text-lg text-slate-900"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Mode <span className="text-red-500">*</span>
              <span className="text-slate-400 font-normal ml-1">(भुगतान माध्यम)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${
                  paymentMode === 'cash'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                💵 Cash (नकद)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${
                  paymentMode === 'upi'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-200'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                📱 UPI (GPay/PhonePe)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('bank')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition ${
                  paymentMode === 'bank'
                    ? 'bg-purple-50 border-purple-500 text-purple-800 ring-2 ring-purple-200'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                🏦 Bank Transfer
              </button>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note / Remarks
              <span className="text-slate-400 font-normal ml-1">(टिप्पणी / विवरण)</span>
            </label>
            <input
              type="text"
              placeholder="उदा. Partial payment / final settlement"
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
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
            >
              भुगतान सेव करें (Save & View Receipt)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
