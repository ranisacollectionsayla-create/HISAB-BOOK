import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { SalaryPaymentRecord, PaymentMode } from '../types';
import { formatINR, formatDateDDMMYYYY, getMonthLabel } from '../utils/formatters';
import { exportPaymentsToExcel } from '../utils/excelExport';
import {
  CreditCard,
  PlusCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Trash2,
  FileText,
  Printer,
  CheckCircle,
} from 'lucide-react';
import { SalaryPaymentModal } from './Modals/SalaryPaymentModal';
import { PaymentVoucherModal } from './Modals/PaymentVoucherModal';

export const Payments: React.FC = () => {
  const {
    state,
    deletePayment,
    setSelectedPaymentVoucher,
    selectedPaymentVoucher,
  } = usePayroll();

  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const employeeMap = new Map(state.employees.map((e) => [e.id, e.name]));

  // Filtered payments
  const filteredPayments = state.payments.filter((p) => {
    if (filterEmployeeId !== 'all' && p.employeeId !== filterEmployeeId) return false;
    if (filterMode !== 'all' && p.paymentMode !== filterMode) return false;
    const empName = employeeMap.get(p.employeeId) || '';
    if (
      searchTerm &&
      !empName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(p.note && p.note.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const totalPaidSum = filteredPayments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Breakdown by mode
  const cashTotal = filteredPayments
    .filter((p) => p.paymentMode === 'cash')
    .reduce((s, p) => s + p.amountPaid, 0);

  const upiTotal = filteredPayments
    .filter((p) => p.paymentMode === 'upi')
    .reduce((s, p) => s + p.amountPaid, 0);

  const bankTotal = filteredPayments
    .filter((p) => p.paymentMode === 'bank')
    .reduce((s, p) => s + p.amountPaid, 0);

  const handleDelete = (p: SalaryPaymentRecord) => {
    const empName = employeeMap.get(p.employeeId) || 'Employee';
    if (
      window.confirm(
        `क्या आप ${empName} का ₹${p.amountPaid} का भुगतान रिकॉर्ड हटाना चाहते हैं?`
      )
    ) {
      deletePayment(p.id);
    }
  };

  const handleExport = () => {
    exportPaymentsToExcel(filteredPayments, employeeMap);
  };

  const modeBadge = (mode: PaymentMode) => {
    switch (mode) {
      case 'cash':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            💵 Cash (नकद)
          </span>
        );
      case 'upi':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            📱 UPI (GPay/PhonePe)
          </span>
        );
      case 'bank':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            🏦 Bank Transfer
          </span>
        );
      default:
        return mode;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">
              वेतन भुगतान इतिहास (Salary Payment Records)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            कर्मचारियों को दिए गए वेतन भुगतानों का संपूर्ण खाता (नकद, यूपीआई व बैंक)
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExport}
            disabled={filteredPayments.length === 0}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
            Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md transition"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            + नया भुगतान दर्ज करें (Pay Salary)
          </button>
        </div>
      </div>

      {/* KPI Cards: Total Paid & Mode Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">कुल भुगतान (Total Paid)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatINR(totalPaidSum)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {filteredPayments.length} भुगतानों का योग
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700">नकद भुगतान (Cash)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{formatINR(cashTotal)}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">कैश द्वारा चुकाया गया</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-blue-700">UPI भुगतान (GPay/PhonePe)</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{formatINR(upiTotal)}</div>
          <div className="text-[11px] text-blue-600 mt-0.5">ऑनलाइन यूपीआई द्वारा</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-purple-700">बैंक ट्रांसफर (NEFT/IMPS)</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{formatINR(bankTotal)}</div>
          <div className="text-[11px] text-purple-600 mt-0.5">सीधे बैंक खाते में</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="कर्मचारी या टिप्पणी से खोजें..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Employee Filter */}
          <select
            value={filterEmployeeId}
            onChange={(e) => setFilterEmployeeId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-white"
          >
            <option value="all">सभी कर्मचारी</option>
            {state.employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          {/* Mode Filter */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-white"
          >
            <option value="all">सभी माध्यम (Modes)</option>
            <option value="cash">नकद (Cash)</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Table of Payments */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            भुगतान सूची ({filteredPayments.length} रिकॉर्ड्स)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-left">
                <th className="p-3">तारीख (Payment Date)</th>
                <th className="p-3">कर्मचारी का नाम</th>
                <th className="p-3">वेतन माह (Salary Month)</th>
                <th className="p-3 text-right">भुगतान राशि (Amount ₹)</th>
                <th className="p-3 text-center">माध्यम (Mode)</th>
                <th className="p-3">टिप्पणी (Note)</th>
                <th className="p-3 text-right">रसीद / कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    कोई भुगतान रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const empName = employeeMap.get(p.employeeId) || 'Unknown Employee';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">
                        {formatDateDDMMYYYY(p.paymentDate)}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{empName}</td>
                      <td className="p-3 font-medium text-slate-700">
                        {getMonthLabel(p.salaryMonth)}
                      </td>
                      <td className="p-3 text-right font-black text-emerald-800 text-sm">
                        {formatINR(p.amountPaid)}
                      </td>
                      <td className="p-3 text-center">{modeBadge(p.paymentMode)}</td>
                      <td className="p-3 text-slate-500">{p.note || '-'}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedPaymentVoucher(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          रसीद (Print)
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition inline"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <SalaryPaymentModal
          onClose={() => setShowAddModal(false)}
          initialEmployeeId={filterEmployeeId !== 'all' ? filterEmployeeId : undefined}
        />
      )}

      {selectedPaymentVoucher && (
        <PaymentVoucherModal
          payment={selectedPaymentVoucher}
          onClose={() => setSelectedPaymentVoucher(null)}
        />
      )}
    </div>
  );
};
