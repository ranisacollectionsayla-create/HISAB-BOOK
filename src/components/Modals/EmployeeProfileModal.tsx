import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Employee } from '../../types';
import { formatINR, formatDateDDMMYYYY, getMonthLabel, getCurrentYYYYMM } from '../../utils/formatters';
import { calculateEmployeeMonthlySummary, calculateEmployeeAdvanceBalance } from '../../utils/salaryCalculator';
import {
  X,
  User,
  Calendar,
  Phone,
  MapPin,
  Briefcase,
  TrendingUp,
  Receipt,
  HandCoins,
  History,
  CreditCard,
  Edit,
  Trash2,
  FileText,
} from 'lucide-react';

interface Props {
  employee: Employee;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
}

export const EmployeeProfileModal: React.FC<Props> = ({ employee, onClose, onEdit }) => {
  const {
    state,
    deleteEmployee,
    setQuickModal,
    setSelectedSalarySlipSummary,
    setSelectedPaymentVoucher,
    selectedMonth,
  } = usePayroll();

  const [activeTab, setActiveTab] = useState<'overview' | 'salary' | 'attendance' | 'payments' | 'advances'>('overview');

  // Employee's filtered data
  const empAttendance = state.attendance
    .filter((a) => a.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const empPayments = state.payments
    .filter((p) => p.employeeId === employee.id)
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  const empAdvances = state.advances
    .filter((a) => a.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const empCommissions = state.commissions
    .filter((c) => c.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const advanceStats = calculateEmployeeAdvanceBalance(
    employee.id,
    state.advances,
    state.adjustments
  );

  // Current selected month summary
  const currentMonthSummary = calculateEmployeeMonthlySummary(
    employee,
    selectedMonth,
    state.attendance,
    state.advances,
    state.commissions,
    state.payments,
    state.adjustments,
    state.settings
  );

  const handleDelete = () => {
    if (
      window.confirm(
        `क्या आप सचमुच ${employee.name} का रिकॉर्ड हटाना चाहते हैं? यह सभी हाजिरी और वेतन रिकॉर्ड भी मिटा देगा।`
      )
    ) {
      deleteEmployee(employee.id);
      onClose();
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">उपस्थित (P)</span>;
      case 'absent':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">अनुपस्थित (A)</span>;
      case 'leave':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">छुट्टी (L)</span>;
      case 'half_day':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">आधा दिन (HD)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header with quick identity */}
        <div className="bg-slate-900 text-white p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {employee.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {employee.name}
                  {employee.commissionEnabled && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      कमीशन {employee.commissionPercentage}%
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {employee.fatherName ? `पिता: ${employee.fatherName}` : ''}{' '}
                  {employee.village ? `• गाँव: ${employee.village}` : ''}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-rose-400" />
                    {employee.salaryType === 'monthly' ? 'मासिक वेतन' : 'दैनिक वेतन'}:{' '}
                    <strong className="text-white">{formatINR(employee.salaryAmount)}</strong>
                  </span>
                  {employee.mobileNumber && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {employee.mobileNumber}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    शामिल: {formatDateDDMMYYYY(employee.joiningDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(employee);
                }}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Edit Employee"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded-lg transition"
                title="Delete Employee"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Tabs */}
          <div className="flex space-x-2 mt-6 border-b border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              ओवरव्यू (Overview)
            </button>
            <button
              onClick={() => setActiveTab('salary')}
              className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'salary'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              वेतन हिसाब ({getMonthLabel(selectedMonth)})
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'attendance'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              हाजिरी इतिहास ({empAttendance.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'payments'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              भुगतान इतिहास ({empPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('advances')}
              className={`pb-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === 'advances'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              पेशगी / उधार ({empAdvances.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[11px] font-medium text-slate-500">इस महीने का वेतन</div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    {formatINR(currentMonthSummary.netSalary)}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-[11px] font-medium text-emerald-700">चुकाया गया (Paid)</div>
                  <div className="text-base font-bold text-emerald-800 mt-1">
                    {formatINR(currentMonthSummary.totalPaid)}
                  </div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="text-[11px] font-medium text-rose-700">बाकी वेतन (Balance)</div>
                  <div className="text-base font-extrabold text-rose-800 mt-1">
                    {formatINR(currentMonthSummary.balanceDue)}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-[11px] font-medium text-amber-800">बकाया पेशगी (Advance)</div>
                  <div className="text-base font-bold text-amber-900 mt-1">
                    {formatINR(advanceStats.remainingBalance)}
                  </div>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-2 items-center justify-between">
                <span className="text-xs font-bold text-slate-700">त्वरित कार्य (Quick Actions):</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      setQuickModal('salary_payment');
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    + वेतन भुगतान (Pay Salary)
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      setQuickModal('add_advance');
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    + पेशगी दें (Give Advance)
                  </button>
                  {employee.commissionEnabled && (
                    <button
                      onClick={() => {
                        onClose();
                        setQuickModal('add_commission');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      + बिक्री कमीशन
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onClose();
                      setSelectedSalarySlipSummary(currentMonthSummary);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    📄 वेतन पर्ची प्रिंट
                  </button>
                </div>
              </div>

              {/* Employee notes / role details */}
              {employee.notes && (
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-700 mb-1">कार्य भूमिका व टिप्पणी:</h4>
                  <p className="text-xs text-slate-600">{employee.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SALARY BREAKDOWN */}
          {activeTab === 'salary' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl">
                <span className="text-xs font-bold text-slate-800">
                  महीना: {getMonthLabel(selectedMonth)}
                </span>
                <button
                  onClick={() => {
                    onClose();
                    setSelectedSalarySlipSummary(currentMonthSummary);
                  }}
                  className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
                >
                  वेतन पर्ची प्रिंट करें
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-slate-50 font-medium">
                      <td className="p-3">मूल वेतन (Basic Salary)</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        {formatINR(currentMonthSummary.basicSalary)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-rose-700">
                        हाजिरी कटौती (Absent/Leave Deduction - {currentMonthSummary.absentDays} Absents)
                      </td>
                      <td className="p-3 text-right font-semibold text-rose-700">
                        -{formatINR(currentMonthSummary.attendanceDeduction)}
                      </td>
                    </tr>
                    {currentMonthSummary.commissionAmount > 0 && (
                      <tr className="text-emerald-700">
                        <td className="p-3">बिक्री कमीशन (Commission)</td>
                        <td className="p-3 text-right font-semibold">
                          +{formatINR(currentMonthSummary.commissionAmount)}
                        </td>
                      </tr>
                    )}
                    {currentMonthSummary.otherAdjustment !== 0 && (
                      <tr>
                        <td className="p-3">अन्य एडजस्टमेंट ({currentMonthSummary.adjustmentReason || 'Bonus/Adjustment'})</td>
                        <td className="p-3 text-right font-semibold">
                          {currentMonthSummary.otherAdjustment > 0 ? '+' : ''}
                          {formatINR(currentMonthSummary.otherAdjustment)}
                        </td>
                      </tr>
                    )}
                    {currentMonthSummary.advanceDeducted > 0 && (
                      <tr className="text-amber-800 bg-amber-50/50">
                        <td className="p-3">पेशगी कटौती (Advance Recovered)</td>
                        <td className="p-3 text-right font-semibold">
                          -{formatINR(currentMonthSummary.advanceDeducted)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                      <td className="p-3 text-sm">कुल देय शुद्ध वेतन (Net Salary)</td>
                      <td className="p-3 text-right text-sm">
                        {formatINR(currentMonthSummary.netSalary)}
                      </td>
                    </tr>
                    <tr className="text-emerald-700 font-bold">
                      <td className="p-3">भुगतान किया गया (Already Paid)</td>
                      <td className="p-3 text-right">
                        {formatINR(currentMonthSummary.totalPaid)}
                      </td>
                    </tr>
                    <tr className="bg-rose-50 font-black text-rose-800">
                      <td className="p-3 text-sm">शेष बाकी वेतन (Balance Due)</td>
                      <td className="p-3 text-right text-sm">
                        {formatINR(currentMonthSummary.balanceDue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE HISTORY */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              {empAttendance.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  कोई कस्टम हाजिरी रिकॉर्ड नहीं मिला। डिफ़ॉल्ट रूप से उपस्थित माना जाता है।
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                      <tr>
                        <th className="p-2.5 text-left">तारीख (Date)</th>
                        <th className="p-2.5 text-center">स्थिति (Status)</th>
                        <th className="p-2.5 text-left">कारण/टिप्पणी</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {empAttendance.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{formatDateDDMMYYYY(a.date)}</td>
                          <td className="p-2.5 text-center">{statusBadge(a.status)}</td>
                          <td className="p-2.5 text-slate-500">{a.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENTS HISTORY */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              {empPayments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  अभी तक कोई वेतन भुगतान दर्ज नहीं हुआ है।
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                      <tr>
                        <th className="p-2.5 text-left">तारीख</th>
                        <th className="p-2.5 text-left">वेतन माह</th>
                        <th className="p-2.5 text-right">रकम (Amount)</th>
                        <th className="p-2.5 text-center">माध्यम (Mode)</th>
                        <th className="p-2.5 text-right">रसीद</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {empPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{formatDateDDMMYYYY(p.paymentDate)}</td>
                          <td className="p-2.5">{getMonthLabel(p.salaryMonth)}</td>
                          <td className="p-2.5 text-right font-bold text-emerald-700">
                            {formatINR(p.amountPaid)}
                          </td>
                          <td className="p-2.5 text-center uppercase font-semibold text-slate-600">
                            {p.paymentMode}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => {
                                onClose();
                                setSelectedPaymentVoucher(p);
                              }}
                              className="text-blue-600 hover:underline font-bold"
                            >
                              रसीद देखें
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ADVANCES HISTORY */}
          {activeTab === 'advances' && (
            <div className="space-y-3">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-amber-800 font-semibold">कुल दी गई पेशगी:</span>{' '}
                  <strong>{formatINR(advanceStats.totalGiven)}</strong> |{' '}
                  <span className="text-amber-800 font-semibold">वसूल हुई:</span>{' '}
                  <strong>{formatINR(advanceStats.totalRecovered)}</strong>
                </div>
                <div className="font-extrabold text-amber-950 text-sm">
                  शेष बकाया: {formatINR(advanceStats.remainingBalance)}
                </div>
              </div>

              {empAdvances.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  कोई पेशगी / उधार दर्ज नहीं है।
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                      <tr>
                        <th className="p-2.5 text-left">तारीख</th>
                        <th className="p-2.5 text-right">राशि (₹)</th>
                        <th className="p-2.5 text-left">कारण/विवरण</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {empAdvances.map((adv) => (
                        <tr key={adv.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium">{formatDateDDMMYYYY(adv.date)}</td>
                          <td className="p-2.5 text-right font-bold text-amber-900">
                            {formatINR(adv.amount)}
                          </td>
                          <td className="p-2.5 text-slate-500">{adv.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
