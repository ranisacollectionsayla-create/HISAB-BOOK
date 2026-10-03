import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { EmployeeMonthlySummary } from '../../types';
import { formatINR, formatDateDDMMYYYY, getMonthLabel, getTodayYYYYMMDD } from '../../utils/formatters';
import { X, Printer, Download, Store, CheckCircle2 } from 'lucide-react';

interface Props {
  summary: EmployeeMonthlySummary;
  onClose: () => void;
}

export const SalarySlipModal: React.FC<Props> = ({ summary, onClose }) => {
  const { state } = usePayroll();
  const todayStr = formatDateDDMMYYYY(getTodayYYYYMMDD());

  const handlePrint = () => {
    window.print();
  };

  const { employee } = summary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none print:w-full">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-lg">वेतन पर्ची (Salary Slip / Payslip)</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              प्रिंट / PDF निकालें
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="printable-area p-8 bg-white text-slate-800 space-y-6">
          {/* Shop Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {state.settings.shopName || 'RANISA COLLECTION'}
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-1">
              {state.settings.shopSubtitle || 'Simple Employee Salary & Attendance Management'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {state.settings.address} • मो: {state.settings.phone}
            </p>
            <div className="inline-block mt-3 px-4 py-1 bg-slate-100 rounded-full border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800">
              वेतन पर्ची / SALARY SLIP - {getMonthLabel(summary.month)}
            </div>
          </div>

          {/* Employee & Month Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="text-slate-500">कर्मचारी का नाम (Employee Name):</div>
              <div className="text-sm font-extrabold text-slate-900">{employee.name}</div>
              {employee.fatherName && (
                <div className="text-slate-600 mt-0.5">पिता: {employee.fatherName}</div>
              )}
              {employee.village && (
                <div className="text-slate-500">गाँव/शहर: {employee.village}</div>
              )}
            </div>

            <div className="text-right sm:text-left">
              <div className="text-slate-500">वेतन प्रकार (Salary Type):</div>
              <div className="font-bold text-slate-800 capitalize">
                {employee.salaryType === 'monthly' ? 'मासिक (Monthly)' : 'दैनिक (Daily Rate)'}
              </div>
              <div className="text-slate-500 mt-1">तारीख जारी (Issue Date):</div>
              <div className="font-semibold text-slate-800">{todayStr}</div>
              {employee.mobileNumber && (
                <div className="text-slate-500">मोबाइल: {employee.mobileNumber}</div>
              )}
            </div>
          </div>

          {/* Attendance Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              हाजिरी विवरण (Attendance Summary)
            </h4>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                <div className="text-slate-500">कुल दिन</div>
                <div className="font-bold text-slate-800">{summary.daysInMonth}</div>
              </div>
              <div className="p-2 border border-emerald-200 rounded-lg bg-emerald-50">
                <div className="text-emerald-700 font-semibold">उपस्थित (P)</div>
                <div className="font-extrabold text-emerald-800">{summary.presentDays}</div>
              </div>
              <div className="p-2 border border-rose-200 rounded-lg bg-rose-50">
                <div className="text-rose-700 font-semibold">गैरहाजिर (A)</div>
                <div className="font-extrabold text-rose-800">{summary.absentDays}</div>
              </div>
              <div className="p-2 border border-amber-200 rounded-lg bg-amber-50">
                <div className="text-amber-700 font-semibold">छुट्टी (L)</div>
                <div className="font-extrabold text-amber-800">{summary.leaveDays}</div>
              </div>
              <div className="p-2 border border-sky-200 rounded-lg bg-sky-50">
                <div className="text-sky-700 font-semibold">आधा दिन (HD)</div>
                <div className="font-extrabold text-sky-800">{summary.halfDays}</div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 text-left">मद विवरण (Description)</th>
                  <th className="py-2 px-3 text-right">रकम (Amount ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3">
                    मूल वेतन दर (Basic Salary Rate)
                    <span className="text-[11px] text-slate-500 ml-1">
                      {employee.salaryType === 'monthly' ? '/ Month' : `/ Day × ${summary.payableDays} days`}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-800">
                    {formatINR(summary.basicSalary)}
                  </td>
                </tr>

                {summary.attendanceDeduction > 0 && (
                  <tr className="text-rose-700 bg-rose-50/30">
                    <td className="py-2 px-3">
                      हाजिरी कटौती (Attendance Deduction - {summary.absentDays} Abs, {summary.leaveDays} Leaves)
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      -{formatINR(summary.attendanceDeduction)}
                    </td>
                  </tr>
                )}

                {summary.commissionAmount > 0 && (
                  <tr className="text-emerald-700 bg-emerald-50/30">
                    <td className="py-2 px-3">
                      बिक्री कमीशन (Sales Commission Earned)
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      +{formatINR(summary.commissionAmount)}
                    </td>
                  </tr>
                )}

                {summary.otherAdjustment !== 0 && (
                  <tr className="bg-slate-50">
                    <td className="py-2 px-3">
                      अन्य एडजस्टमेंट / बोनस ({summary.adjustmentReason || 'Adjustments'})
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {summary.otherAdjustment > 0 ? '+' : ''}
                      {formatINR(summary.otherAdjustment)}
                    </td>
                  </tr>
                )}

                {summary.advanceDeducted > 0 && (
                  <tr className="text-amber-800 bg-amber-50/40">
                    <td className="py-2 px-3">
                      पेशगी / एडवांस कटौती (Advance Recovery Deducted)
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      -{formatINR(summary.advanceDeducted)}
                    </td>
                  </tr>
                )}

                {/* Net Salary Row */}
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="py-2.5 px-3 text-sm">कुल देय वेतन (Net Payable Salary)</td>
                  <td className="py-2.5 px-3 text-right text-sm font-extrabold text-slate-900">
                    {formatINR(summary.netSalary)}
                  </td>
                </tr>

                {/* Paid */}
                <tr className="text-emerald-700">
                  <td className="py-2 px-3">चुकाया गया भुगतान (Already Paid)</td>
                  <td className="py-2 px-3 text-right font-bold">
                    {formatINR(summary.totalPaid)}
                  </td>
                </tr>

                {/* Balance Due */}
                <tr className="bg-rose-50 font-extrabold text-rose-800">
                  <td className="py-2.5 px-3 text-sm">शेष बाकी वेतन (Balance Due)</td>
                  <td className="py-2.5 px-3 text-right text-sm font-black">
                    {formatINR(summary.balanceDue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-12 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <div className="border-t border-slate-400 pt-2 font-semibold text-slate-700">
                कर्मचारी हस्ताक्षर (Employee Signature)
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-2 font-semibold text-slate-700">
                दुकानदार / ऑथराइज्ड हस्ताक्षर (Ranisa Collection)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
