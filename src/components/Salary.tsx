import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import {
  formatINR,
  getMonthLabel,
  formatDateDDMMYYYY,
  getTodayYYYYMMDD,
} from '../utils/formatters';
import { calculateEmployeeMonthlySummary } from '../utils/salaryCalculator';
import { exportSalarySheetToExcel } from '../utils/excelExport';
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Printer,
  Sliders,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { SalaryAdjustmentModal } from './Modals/SalaryAdjustmentModal';
import { SalarySlipModal } from './Modals/SalarySlipModal';
import { SalaryPaymentModal } from './Modals/SalaryPaymentModal';

export const Salary: React.FC = () => {
  const {
    state,
    selectedMonth,
    setSelectedMonth,
    setSelectedSalarySlipSummary,
    selectedSalarySlipSummary,
  } = usePayroll();

  const [adjustingEmpId, setAdjustingEmpId] = useState<string | null>(null);
  const [payingEmpId, setPayingEmpId] = useState<string | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const prevY = date.getFullYear();
    const prevM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${prevY}-${prevM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${nextY}-${nextM}`);
  };

  // Calculate summaries for all employees in selected month
  const summaries = state.employees.map((emp) =>
    calculateEmployeeMonthlySummary(
      emp,
      selectedMonth,
      state.attendance,
      state.advances,
      state.commissions,
      state.payments,
      state.adjustments,
      state.settings
    )
  );

  // Totals
  const totalBasic = summaries.reduce((sum, s) => sum + s.basicSalary, 0);
  const totalAttDeduction = summaries.reduce((sum, s) => sum + s.attendanceDeduction, 0);
  const totalCommission = summaries.reduce((sum, s) => sum + s.commissionAmount, 0);
  const totalAdvanceDeducted = summaries.reduce((sum, s) => sum + s.advanceDeducted, 0);
  const totalAdjustment = summaries.reduce((sum, s) => sum + s.otherAdjustment, 0);
  const totalNet = summaries.reduce((sum, s) => sum + s.netSalary, 0);
  const totalPaid = summaries.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalBalance = summaries.reduce((sum, s) => sum + Math.max(0, s.balanceDue), 0);

  const handleExportExcel = () => {
    exportSalarySheetToExcel(summaries, getMonthLabel(selectedMonth));
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">
              मासिक वेतन पत्रक (Monthly Salary Sheet)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            हाजिरी, एडवांस, कमीशन व एडजस्टमेंट के आधार पर स्वचालित वेतन गणना
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 px-2 py-1 focus:outline-none"
            />
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
            Excel
          </button>

          <button
            onClick={handlePrintSheet}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-900 text-white transition shadow-sm"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            प्रिंट / PDF
          </button>
        </div>
      </div>

      {/* Summary KPI totals bar */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-500">कुल शुद्ध वेतन (Net Salary)</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">{formatINR(totalNet)}</div>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl">
          <div className="text-[11px] font-semibold text-emerald-700">चुकाया गया (Paid)</div>
          <div className="text-lg font-black text-emerald-800 mt-0.5">{formatINR(totalPaid)}</div>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl">
          <div className="text-[11px] font-semibold text-rose-700">कुल बाकी वेतन (Balance Due)</div>
          <div className="text-lg font-black text-rose-800 mt-0.5">{formatINR(totalBalance)}</div>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl">
          <div className="text-[11px] font-semibold text-amber-800">पेशगी कटौती (Advance Recovered)</div>
          <div className="text-lg font-black text-amber-900 mt-0.5">{formatINR(totalAdvanceDeducted)}</div>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="printable-area bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Printable Shop Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 uppercase">
              {state.settings.shopName || 'RANISA COLLECTION'} - वेतन पत्रक (SALARY SHEET)
            </h3>
            <p className="text-xs text-slate-500">
              महीना: <strong>{getMonthLabel(selectedMonth)}</strong> • तारीख:{' '}
              {formatDateDDMMYYYY(getTodayYYYYMMDD())}
            </p>
          </div>
          <div className="text-xs text-slate-500">
            दुकानदार / व्यवस्थापक हस्ताक्षर: _______________________
          </div>
        </div>

        {/* Salary Sheet Table (Prompt Requirement #8:
            Columns: Employee Name, Salary, Present, Absent, Leave, Half Day, Commission, Advance, Adjustment, Net Salary, Paid, Balance) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-left">
                <th className="p-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200 min-w-[170px]">
                  Employee Name (कर्मचारी)
                </th>
                <th className="p-2.5 text-right min-w-[90px]">Salary (मूल दर)</th>
                <th className="p-2 text-center text-emerald-800 min-w-[50px]">P</th>
                <th className="p-2 text-center text-rose-800 min-w-[50px]">A</th>
                <th className="p-2 text-center text-amber-800 min-w-[50px]">L</th>
                <th className="p-2 text-center text-sky-800 min-w-[50px]">HD</th>
                <th className="p-2.5 text-right text-indigo-700 min-w-[90px]">Commission</th>
                <th className="p-2.5 text-right text-amber-900 min-w-[90px]">Advance</th>
                <th className="p-2.5 text-right min-w-[90px]">Adjustment</th>
                <th className="p-2.5 text-right font-extrabold text-slate-900 bg-slate-50 min-w-[100px]">
                  Net Salary
                </th>
                <th className="p-2.5 text-right font-bold text-emerald-700 min-w-[90px]">Paid</th>
                <th className="p-2.5 text-right font-black text-rose-700 bg-rose-50/50 min-w-[100px]">
                  Balance
                </th>
                <th className="no-print p-2.5 text-right min-w-[130px]">कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {summaries.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-slate-400">
                    कोई कर्मचारी नहीं मिला।
                  </td>
                </tr>
              ) : (
                summaries.map((s) => (
                  <tr key={s.employee.id} className="hover:bg-slate-50/80">
                    {/* Employee Name */}
                    <td className="p-3 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200">
                      <div>{s.employee.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {s.employee.fatherName ? `पिता: ${s.employee.fatherName}` : ''}
                      </div>
                    </td>

                    {/* Basic Salary */}
                    <td className="p-2.5 text-right font-semibold text-slate-800">
                      {formatINR(s.basicSalary)}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {s.employee.salaryType === 'monthly' ? 'मासिक' : 'दैनिक'}
                      </div>
                    </td>

                    {/* Present */}
                    <td className="p-2 text-center font-bold text-emerald-800 bg-emerald-50/30">
                      {s.presentDays}
                    </td>

                    {/* Absent */}
                    <td className="p-2 text-center font-bold text-rose-800 bg-rose-50/30">
                      {s.absentDays}
                    </td>

                    {/* Leave */}
                    <td className="p-2 text-center font-bold text-amber-800 bg-amber-50/30">
                      {s.leaveDays}
                    </td>

                    {/* Half Day */}
                    <td className="p-2 text-center font-bold text-sky-800 bg-sky-50/30">
                      {s.halfDays}
                    </td>

                    {/* Commission */}
                    <td className="p-2.5 text-right font-semibold text-indigo-700">
                      {s.commissionAmount > 0 ? formatINR(s.commissionAmount) : '-'}
                    </td>

                    {/* Advance Deducted */}
                    <td className="p-2.5 text-right font-semibold text-amber-900">
                      {s.advanceDeducted > 0 ? `-${formatINR(s.advanceDeducted)}` : '-'}
                    </td>

                    {/* Adjustment */}
                    <td className="p-2.5 text-right font-semibold text-slate-700">
                      {s.otherAdjustment !== 0
                        ? `${s.otherAdjustment > 0 ? '+' : ''}${formatINR(s.otherAdjustment)}`
                        : '-'}
                    </td>

                    {/* Net Salary */}
                    <td className="p-2.5 text-right font-black text-slate-900 bg-slate-50 text-sm">
                      {formatINR(s.netSalary)}
                    </td>

                    {/* Paid */}
                    <td className="p-2.5 text-right font-bold text-emerald-700">
                      {formatINR(s.totalPaid)}
                    </td>

                    {/* Balance */}
                    <td className="p-2.5 text-right font-black text-rose-700 bg-rose-50/50 text-sm">
                      {formatINR(s.balanceDue)}
                    </td>

                    {/* Actions (Hidden in print) */}
                    <td className="no-print p-2.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setPayingEmpId(s.employee.id)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-[11px] transition"
                        title="वेतन भुगतान दर्ज करें"
                      >
                        भुगतान
                      </button>
                      <button
                        onClick={() => setAdjustingEmpId(s.employee.id)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                        title="एडजस्टमेंट / पेशगी कटौती बदलें"
                      >
                        <Sliders className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => setSelectedSalarySlipSummary(s)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-[11px] transition"
                        title="वेतन पर्ची (Payslip) देखें व प्रिंट करें"
                      >
                        पर्ची
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Total Row */}
            <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td className="p-3 sticky left-0 bg-slate-100 border-r border-slate-200">
                  कुल योग (TOTALS)
                </td>
                <td className="p-2.5 text-right">{formatINR(totalBasic)}</td>
                <td className="p-2 text-center">-</td>
                <td className="p-2 text-center">-</td>
                <td className="p-2 text-center">-</td>
                <td className="p-2 text-center">-</td>
                <td className="p-2.5 text-right text-indigo-700">{formatINR(totalCommission)}</td>
                <td className="p-2.5 text-right text-amber-900">
                  {totalAdvanceDeducted > 0 ? `-${formatINR(totalAdvanceDeducted)}` : '₹0'}
                </td>
                <td className="p-2.5 text-right">{formatINR(totalAdjustment)}</td>
                <td className="p-2.5 text-right text-sm font-black bg-slate-200">
                  {formatINR(totalNet)}
                </td>
                <td className="p-2.5 text-right text-emerald-800">{formatINR(totalPaid)}</td>
                <td className="p-2.5 text-right text-sm font-black text-rose-800 bg-rose-100">
                  {formatINR(totalBalance)}
                </td>
                <td className="no-print p-2.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjustingEmpId && (
        <SalaryAdjustmentModal
          employeeId={adjustingEmpId}
          month={selectedMonth}
          onClose={() => setAdjustingEmpId(null)}
        />
      )}

      {/* Payment Modal */}
      {payingEmpId && (
        <SalaryPaymentModal
          initialEmployeeId={payingEmpId}
          initialMonth={selectedMonth}
          onClose={() => setPayingEmpId(null)}
        />
      )}

      {/* Salary Slip Modal */}
      {selectedSalarySlipSummary && (
        <SalarySlipModal
          summary={selectedSalarySlipSummary}
          onClose={() => setSelectedSalarySlipSummary(null)}
        />
      )}
    </div>
  );
};
