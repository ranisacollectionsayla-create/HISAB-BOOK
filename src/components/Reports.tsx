import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import {
  formatINR,
  formatDateDDMMYYYY,
  getMonthLabel,
  getCurrentYYYYMM,
  getTodayYYYYMMDD,
} from '../utils/formatters';
import { calculateEmployeeMonthlySummary, calculateEmployeeAdvanceBalance } from '../utils/salaryCalculator';
import {
  exportSalarySheetToExcel,
  exportEmployeesToExcel,
  exportAttendanceReportToExcel,
  exportPaymentsToExcel,
  exportAdvancesToExcel,
  exportCommissionsToExcel,
} from '../utils/excelExport';
import {
  FileBarChart2,
  Printer,
  FileSpreadsheet,
  Filter,
  Calendar,
  Users,
  CreditCard,
  HandCoins,
  TrendingUp,
  Scale,
  CalendarCheck,
} from 'lucide-react';

type ReportType =
  | 'monthly_salary'
  | 'employee_wise_salary'
  | 'attendance_summary'
  | 'payment_history'
  | 'advance_ledger'
  | 'commission_summary'
  | 'balance_due';

export const Reports: React.FC = () => {
  const { state, selectedMonth, setSelectedMonth } = usePayroll();

  const [activeReport, setActiveReport] = useState<ReportType>('monthly_salary');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [reportMonth, setReportMonth] = useState<string>(selectedMonth);
  const [startDate, setStartDate] = useState<string>(`${selectedMonth}-01`);
  const [endDate, setEndDate] = useState<string>(getTodayYYYYMMDD());

  const employeeMap = new Map(state.employees.map((e) => [e.id, e.name]));

  // 1. Monthly Summaries for the chosen month
  const targetEmployees =
    selectedEmployeeId === 'all'
      ? state.employees
      : state.employees.filter((e) => e.id === selectedEmployeeId);

  const monthlySummaries = targetEmployees.map((emp) =>
    calculateEmployeeMonthlySummary(
      emp,
      reportMonth,
      state.attendance,
      state.advances,
      state.commissions,
      state.payments,
      state.adjustments,
      state.settings
    )
  );

  // 2. Attendance rows in date range
  const filteredAttendance = state.attendance.filter((att) => {
    if (selectedEmployeeId !== 'all' && att.employeeId !== selectedEmployeeId) return false;
    if (startDate && att.date < startDate) return false;
    if (endDate && att.date > endDate) return false;
    return true;
  });

  // 3. Payments in date range
  const filteredPayments = state.payments.filter((p) => {
    if (selectedEmployeeId !== 'all' && p.employeeId !== selectedEmployeeId) return false;
    if (startDate && p.paymentDate < startDate) return false;
    if (endDate && p.paymentDate > endDate) return false;
    return true;
  });

  // 4. Advances in date range
  const filteredAdvances = state.advances.filter((a) => {
    if (selectedEmployeeId !== 'all' && a.employeeId !== selectedEmployeeId) return false;
    if (startDate && a.date < startDate) return false;
    if (endDate && a.date > endDate) return false;
    return true;
  });

  // 5. Commissions in date range
  const filteredCommissions = state.commissions.filter((c) => {
    if (selectedEmployeeId !== 'all' && c.employeeId !== selectedEmployeeId) return false;
    if (startDate && c.date < startDate) return false;
    if (endDate && c.date > endDate) return false;
    return true;
  });

  // 6. Balance Due list
  const balanceDueList = monthlySummaries.filter((s) => s.balanceDue > 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExcelExport = () => {
    switch (activeReport) {
      case 'monthly_salary':
      case 'employee_wise_salary':
        exportSalarySheetToExcel(monthlySummaries, getMonthLabel(reportMonth));
        break;
      case 'attendance_summary':
        const attRows = filteredAttendance.map((a) => ({
          date: a.date,
          employeeName: employeeMap.get(a.employeeId) || 'Employee',
          status: a.status.toUpperCase(),
          note: a.note,
        }));
        exportAttendanceReportToExcel(attRows, `Ranisa_Attendance_Report`);
        break;
      case 'payment_history':
        exportPaymentsToExcel(filteredPayments, employeeMap);
        break;
      case 'advance_ledger':
        exportAdvancesToExcel(filteredAdvances, employeeMap);
        break;
      case 'commission_summary':
        exportCommissionsToExcel(filteredCommissions, employeeMap);
        break;
      case 'balance_due':
        exportSalarySheetToExcel(balanceDueList, `Balance_Due_${reportMonth}`);
        break;
    }
  };

  const reportTabs = [
    { id: 'monthly_salary', label: 'मासिक वेतन रिपोर्ट', sub: 'Monthly Salary', icon: FileBarChart2 },
    { id: 'employee_wise_salary', label: 'कर्मचारी-वार वेतन', sub: 'Employee-wise', icon: Users },
    { id: 'attendance_summary', label: 'हाजिरी रिपोर्ट', sub: 'Attendance', icon: CalendarCheck },
    { id: 'payment_history', label: 'भुगतान रिपोर्ट', sub: 'Payments', icon: CreditCard },
    { id: 'advance_ledger', label: 'पेशगी / उधार खाता', sub: 'Advance Ledger', icon: HandCoins },
    { id: 'commission_summary', label: 'कमीशन रिपोर्ट', sub: 'Commissions', icon: TrendingUp },
    { id: 'balance_due', label: 'बकाया वेतन सूची', sub: 'Balance Due', icon: Scale },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <FileBarChart2 className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">
              व्यापार रिपोर्ट्स व विवरण (Reports & Analytics)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            वेतन, हाजिरी, भुगतान, पेशगी व बिक्री कमीशन की विस्तृत प्रिंट व एक्सेल रिपोर्ट्स
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExcelExport}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
            Excel डाउनलोड
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            प्रिंट रिपोर्ट (Print / PDF)
          </button>
        </div>
      </div>

      {/* Report Selection Tabs (Hidden in print) */}
      <div className="no-print bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as ReportType)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className={`text-[10px] font-normal ${isActive ? 'text-purple-200' : 'text-slate-400'}`}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Bar (Employee, Month, Date Range) (Hidden in print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">फ़िल्टर (Filters):</span>
        </div>

        {/* Employee Filter */}
        <div>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
          >
            <option value="all">सभी कर्मचारी ({state.employees.length})</option>
            {state.employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        {(activeReport === 'monthly_salary' ||
          activeReport === 'employee_wise_salary' ||
          activeReport === 'balance_due') && (
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-medium">माह:</span>
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white"
            />
          </div>
        )}

        {/* Date Range for transactions */}
        {(activeReport === 'attendance_summary' ||
          activeReport === 'payment_history' ||
          activeReport === 'advance_ledger' ||
          activeReport === 'commission_summary') && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">तारीख से:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-xl font-semibold"
            />
            <span className="text-slate-500 font-medium">तक:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-xl font-semibold"
            />
          </div>
        )}
      </div>

      {/* Printable Report Document Card */}
      <div className="printable-area bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-5">
        {/* Printable Report Header */}
        <div className="text-center border-b pb-4 border-slate-300">
          <h2 className="text-xl font-black text-slate-900 uppercase">
            {state.settings.shopName || 'RANISA COLLECTION'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {state.settings.address} • {state.settings.phone}
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-full text-xs font-bold uppercase tracking-wider">
            {reportTabs.find((t) => t.id === activeReport)?.label} (
            {activeReport === 'monthly_salary' || activeReport === 'balance_due'
              ? getMonthLabel(reportMonth)
              : `${formatDateDDMMYYYY(startDate)} से ${formatDateDDMMYYYY(endDate)}`}
            )
          </div>
        </div>

        {/* REPORT CONTENT VIEW */}

        {/* REPORT 1 & 2: Monthly & Employee-wise Salary Sheet */}
        {(activeReport === 'monthly_salary' || activeReport === 'employee_wise_salary') && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-left">
                  <th className="p-2.5">कर्मचारी (Employee)</th>
                  <th className="p-2.5 text-right">मूल वेतन</th>
                  <th className="p-2 text-center">P</th>
                  <th className="p-2 text-center">A</th>
                  <th className="p-2 text-center">L</th>
                  <th className="p-2 text-center">HD</th>
                  <th className="p-2.5 text-right">कटौती</th>
                  <th className="p-2.5 text-right">कमीशन</th>
                  <th className="p-2.5 text-right">एडवांस</th>
                  <th className="p-2.5 text-right font-black">कुल वेतन (Net)</th>
                  <th className="p-2.5 text-right font-bold text-emerald-700">चुकाया (Paid)</th>
                  <th className="p-2.5 text-right font-black text-rose-700">बाकी (Due)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthlySummaries.map((s) => (
                  <tr key={s.employee.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">
                      <div>{s.employee.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {s.employee.fatherName ? `पिता: ${s.employee.fatherName}` : ''}
                      </div>
                    </td>
                    <td className="p-2.5 text-right">{formatINR(s.basicSalary)}</td>
                    <td className="p-2 text-center font-bold text-emerald-800">{s.presentDays}</td>
                    <td className="p-2 text-center font-bold text-rose-800">{s.absentDays}</td>
                    <td className="p-2 text-center font-bold text-amber-800">{s.leaveDays}</td>
                    <td className="p-2 text-center font-bold text-sky-800">{s.halfDays}</td>
                    <td className="p-2.5 text-right text-rose-700">
                      {s.attendanceDeduction > 0 ? `-${formatINR(s.attendanceDeduction)}` : '₹0'}
                    </td>
                    <td className="p-2.5 text-right text-indigo-700">
                      {s.commissionAmount > 0 ? formatINR(s.commissionAmount) : '₹0'}
                    </td>
                    <td className="p-2.5 text-right text-amber-900">
                      {s.advanceDeducted > 0 ? `-${formatINR(s.advanceDeducted)}` : '₹0'}
                    </td>
                    <td className="p-2.5 text-right font-black text-slate-900 bg-slate-50">
                      {formatINR(s.netSalary)}
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">
                      {formatINR(s.totalPaid)}
                    </td>
                    <td className="p-2.5 text-right font-black text-rose-700 bg-rose-50/50">
                      {formatINR(s.balanceDue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: Attendance Summary */}
        {activeReport === 'attendance_summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-left">
                  <th className="p-2.5">तारीख (Date)</th>
                  <th className="p-2.5">कर्मचारी का नाम</th>
                  <th className="p-2.5 text-center">स्थिति (Status)</th>
                  <th className="p-2.5">टिप्पणी / विवरण</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">
                      चयनित अवधि में कोई हाजिरी रिकॉर्ड नहीं मिला।
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium">{formatDateDDMMYYYY(a.date)}</td>
                      <td className="p-2.5 font-bold">{employeeMap.get(a.employeeId)}</td>
                      <td className="p-2.5 text-center uppercase font-bold">
                        {a.status === 'present' && <span className="text-emerald-700">उपस्थित (Present)</span>}
                        {a.status === 'absent' && <span className="text-rose-700">अनुपस्थित (Absent)</span>}
                        {a.status === 'leave' && <span className="text-amber-800">छुट्टी (Leave)</span>}
                        {a.status === 'half_day' && <span className="text-sky-800">आधा दिन (Half Day)</span>}
                      </td>
                      <td className="p-2.5 text-slate-500">{a.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 4: Payment History */}
        {activeReport === 'payment_history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-left">
                  <th className="p-2.5">तारीख (Date)</th>
                  <th className="p-2.5">कर्मचारी का नाम</th>
                  <th className="p-2.5">वेतन माह</th>
                  <th className="p-2.5 text-center">माध्यम (Mode)</th>
                  <th className="p-2.5 text-right font-bold">भुगतान राशि (Amount ₹)</th>
                  <th className="p-2.5">टिप्पणी</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      कोई भुगतान नहीं मिला।
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium">{formatDateDDMMYYYY(p.paymentDate)}</td>
                      <td className="p-2.5 font-bold">{employeeMap.get(p.employeeId)}</td>
                      <td className="p-2.5">{getMonthLabel(p.salaryMonth)}</td>
                      <td className="p-2.5 text-center uppercase font-semibold text-slate-600">
                        {p.paymentMode}
                      </td>
                      <td className="p-2.5 text-right font-black text-emerald-800 text-sm">
                        {formatINR(p.amountPaid)}
                      </td>
                      <td className="p-2.5 text-slate-500">{p.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 5: Advance Ledger */}
        {activeReport === 'advance_ledger' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-left">
                  <th className="p-2.5">तारीख</th>
                  <th className="p-2.5">कर्मचारी का नाम</th>
                  <th className="p-2.5 text-right">पेशगी राशि (₹)</th>
                  <th className="p-2.5">कारण / विवरण</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAdvances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">
                      कोई पेशगी रिकॉर्ड नहीं मिला।
                    </td>
                  </tr>
                ) : (
                  filteredAdvances.map((adv) => (
                    <tr key={adv.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium">{formatDateDDMMYYYY(adv.date)}</td>
                      <td className="p-2.5 font-bold">{employeeMap.get(adv.employeeId)}</td>
                      <td className="p-2.5 text-right font-black text-amber-900 text-sm">
                        {formatINR(adv.amount)}
                      </td>
                      <td className="p-2.5 text-slate-600">{adv.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 6: Commission Summary */}
        {activeReport === 'commission_summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-left">
                  <th className="p-2.5">तारीख</th>
                  <th className="p-2.5">कर्मचारी का नाम</th>
                  <th className="p-2.5 text-right">बिक्री राशि (₹)</th>
                  <th className="p-2.5 text-center">कमीशन %</th>
                  <th className="p-2.5 text-right">कमीशन रकम (₹)</th>
                  <th className="p-2.5">विवरण</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      कोई कमीशन रिकॉर्ड नहीं मिला।
                    </td>
                  </tr>
                ) : (
                  filteredCommissions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium">{formatDateDDMMYYYY(c.date)}</td>
                      <td className="p-2.5 font-bold">{employeeMap.get(c.employeeId)}</td>
                      <td className="p-2.5 text-right font-semibold">{formatINR(c.salesAmount)}</td>
                      <td className="p-2.5 text-center font-bold">{c.commissionPercentage}%</td>
                      <td className="p-2.5 text-right font-black text-indigo-900 text-sm">
                        {formatINR(c.commissionAmount)}
                      </td>
                      <td className="p-2.5 text-slate-600">{c.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 7: Balance Due Report */}
        {activeReport === 'balance_due' && (
          <div className="overflow-x-auto">
            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 mb-3 text-xs text-rose-800">
              <strong>{getMonthLabel(reportMonth)}</strong> के लिए जिन कर्मचारियों का वेतन अभी तक बाकी है:
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-left">
                  <th className="p-2.5">कर्मचारी का नाम</th>
                  <th className="p-2.5 text-right">कुल वेतन (Net)</th>
                  <th className="p-2.5 text-right">चुकाया गया</th>
                  <th className="p-2.5 text-right font-black text-rose-800">बाकी रकम (Balance Due ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {balanceDueList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-emerald-700 font-bold">
                      ✓ इस महीने सभी कर्मचारियों का पूरा वेतन चुकाया जा चुका है! (No Balance Due)
                    </td>
                  </tr>
                ) : (
                  balanceDueList.map((s) => (
                    <tr key={s.employee.id} className="hover:bg-rose-50/30">
                      <td className="p-2.5 font-bold text-slate-900">{s.employee.name}</td>
                      <td className="p-2.5 text-right">{formatINR(s.netSalary)}</td>
                      <td className="p-2.5 text-right font-semibold text-emerald-700">
                        {formatINR(s.totalPaid)}
                      </td>
                      <td className="p-2.5 text-right font-black text-rose-800 text-sm">
                        {formatINR(s.balanceDue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures for printed report */}
        <div className="pt-10 grid grid-cols-2 gap-8 text-xs text-center border-t border-slate-200">
          <div>
            <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">
              रिपोर्ट तैयारकर्ता (Prepared By)
            </div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">
              दुकानदार हस्ताक्षर (Ranisa Collection)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
