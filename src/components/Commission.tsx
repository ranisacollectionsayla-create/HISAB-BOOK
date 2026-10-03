import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { CommissionRecord } from '../types';
import { formatINR, formatDateDDMMYYYY, getMonthLabel } from '../utils/formatters';
import { exportCommissionsToExcel } from '../utils/excelExport';
import {
  TrendingUp,
  PlusCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Trash2,
  Calendar,
  Percent,
} from 'lucide-react';
import { AddCommissionModal } from './Modals/AddCommissionModal';

export const Commission: React.FC = () => {
  const { state, deleteCommission, selectedMonth } = usePayroll();
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const employeeMap = new Map(state.employees.map((e) => [e.id, e.name]));

  // Filtered records
  const filteredCommissions = state.commissions.filter((c) => {
    if (filterEmployeeId !== 'all' && c.employeeId !== filterEmployeeId) return false;
    const empName = employeeMap.get(c.employeeId) || '';
    if (
      searchTerm &&
      !empName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(c.note && c.note.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  // Calculate totals
  const totalSalesRecorded = filteredCommissions.reduce((sum, c) => sum + c.salesAmount, 0);
  const totalCommissionEarned = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  const currentMonthCommissions = state.commissions.filter((c) =>
    c.date.startsWith(selectedMonth)
  );
  const currentMonthCommTotal = currentMonthCommissions.reduce(
    (sum, c) => sum + c.commissionAmount,
    0
  );

  const handleDelete = (c: CommissionRecord) => {
    const empName = employeeMap.get(c.employeeId) || 'Employee';
    if (window.confirm(`क्या आप ${empName} का ₹${c.commissionAmount} कमीशन रिकॉर्ड हटाना चाहते हैं?`)) {
      deleteCommission(c.id);
    }
  };

  const handleExport = () => {
    exportCommissionsToExcel(filteredCommissions, employeeMap);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">
              बिक्री कमीशन प्रबंधन (Sales Commission)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            कपड़ा दुकान की बिक्री पर स्टाफ को प्रोत्साहन कमीशन (दैनिक या मासिक बिक्री पर)
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExport}
            disabled={filteredCommissions.length === 0}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
            Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            + बिक्री कमीशन जोड़ें (Add Commission)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">कुल दर्ज बिक्री (Total Sales)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(totalSalesRecorded)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">कर्मचारियों द्वारा की गई बिक्री</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 shadow-xs">
          <div className="text-xs font-bold text-indigo-900">
            कुल कमीशन बना (Total Commission)
          </div>
          <div className="text-2xl font-black text-indigo-900 mt-1">
            {formatINR(totalCommissionEarned)}
          </div>
          <div className="text-[11px] text-indigo-700 mt-0.5">
            सभी बिक्री पर कुल अर्जित कमीशन
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-700">
            इस महीने का कमीशन ({getMonthLabel(selectedMonth)})
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {formatINR(currentMonthCommTotal)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            इस महीने के वेतन पत्रक में शामिल होगा
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="कर्मचारी या बिक्री विवरण से खोजें..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterEmployeeId}
            onChange={(e) => setFilterEmployeeId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-white"
          >
            <option value="all">सभी कर्मचारी</option>
            {state.employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} {emp.commissionEnabled ? `(${emp.commissionPercentage}%)` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            बिक्री कमीशन सूची ({filteredCommissions.length} रिकॉर्ड्स)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-left">
                <th className="p-3">तारीख (Date)</th>
                <th className="p-3">कर्मचारी का नाम</th>
                <th className="p-3">प्रकार (Type)</th>
                <th className="p-3 text-right">बिक्री राशि (Sales ₹)</th>
                <th className="p-3 text-center">कमीशन %</th>
                <th className="p-3 text-right">कमीशन रकम (Amount ₹)</th>
                <th className="p-3">विवरण (Note)</th>
                <th className="p-3 text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    कोई कमीशन रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((c) => {
                  const empName = employeeMap.get(c.employeeId) || 'Unknown Employee';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">
                        {formatDateDDMMYYYY(c.date)}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{empName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {c.type === 'daily' ? 'दैनिक बिक्री' : 'मासिक बिक्री'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-800">
                        {formatINR(c.salesAmount)}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-600">
                        {c.commissionPercentage}%
                      </td>
                      <td className="p-3 text-right font-black text-indigo-900 text-sm">
                        {formatINR(c.commissionAmount)}
                      </td>
                      <td className="p-3 text-slate-600">{c.note || '-'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <AddCommissionModal
          onClose={() => setShowAddModal(false)}
          initialEmployeeId={filterEmployeeId !== 'all' ? filterEmployeeId : undefined}
        />
      )}
    </div>
  );
};
