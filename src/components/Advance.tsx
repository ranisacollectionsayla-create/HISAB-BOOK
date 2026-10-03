import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { AdvanceRecord } from '../types';
import { formatINR, formatDateDDMMYYYY, getTodayYYYYMMDD } from '../utils/formatters';
import { calculateEmployeeAdvanceBalance } from '../utils/salaryCalculator';
import { exportAdvancesToExcel } from '../utils/excelExport';
import {
  HandCoins,
  PlusCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { AddAdvanceModal } from './Modals/AddAdvanceModal';

export const Advance: React.FC = () => {
  const { state, deleteAdvance, setQuickModal } = usePayroll();
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Overall totals across shop
  let totalAdvanceGiven = 0;
  let totalAdvanceRecovered = 0;
  let totalAdvanceRemaining = 0;

  state.employees.forEach((emp) => {
    const stats = calculateEmployeeAdvanceBalance(emp.id, state.advances, state.adjustments);
    totalAdvanceGiven += stats.totalGiven;
    totalAdvanceRecovered += stats.totalRecovered;
    totalAdvanceRemaining += stats.remainingBalance;
  });

  // Employee mapping
  const employeeMap = new Map(state.employees.map((e) => [e.id, e.name]));

  // Filtered advances list
  const filteredAdvances = state.advances.filter((adv) => {
    if (filterEmployeeId !== 'all' && adv.employeeId !== filterEmployeeId) return false;
    const empName = employeeMap.get(adv.employeeId) || '';
    if (
      searchTerm &&
      !empName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(adv.note && adv.note.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleDelete = (adv: AdvanceRecord) => {
    const empName = employeeMap.get(adv.employeeId) || 'Employee';
    if (window.confirm(`क्या आप ${empName} का ₹${adv.amount} पेशगी रिकॉर्ड हटाना चाहते हैं?`)) {
      deleteAdvance(adv.id);
    }
  };

  const handleExport = () => {
    exportAdvancesToExcel(filteredAdvances, employeeMap);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <HandCoins className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900">
              पेशगी / उधार प्रबंधन (Advance Management)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            कर्मचारियों को दी गई अग्रिम राशि का रिकॉर्ड व वेतन से वसूली का हिसाब
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExport}
            disabled={filteredAdvances.length === 0}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
            Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-700 shadow-md transition"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            + पेशगी दें (Give Advance)
          </button>
        </div>
      </div>

      {/* KPI Cards: Total Advance, Recovered Advance, Remaining Advance (Requirement #5) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Advance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">कुल दी गई पेशगी (Total Advance)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(totalAdvanceGiven)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">सभी कर्मचारियों को कुल दी गई</div>
        </div>

        {/* Recovered Advance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700">वसूल हुई पेशगी (Recovered)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {formatINR(totalAdvanceRecovered)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">वेतन से काटी जा चुकी राशि</div>
        </div>

        {/* Remaining Advance */}
        <div className="bg-white p-4 rounded-2xl border border-amber-300 bg-amber-50/40 shadow-xs">
          <div className="text-xs font-bold text-amber-900">शेष बकाया पेशगी (Remaining Balance)</div>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {formatINR(totalAdvanceRemaining)}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">कर्मचारियों पर अभी बकाया</div>
        </div>
      </div>

      {/* Employee-wise Advance Balance Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          कर्मचारी-वार बकाया पेशगी (Employee Advance Balances)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {state.employees.map((emp) => {
            const stats = calculateEmployeeAdvanceBalance(
              emp.id,
              state.advances,
              state.adjustments
            );
            return (
              <div
                key={emp.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{emp.name}</div>
                  <div className="text-[11px] text-slate-500">
                    दी गई: {formatINR(stats.totalGiven)} • वसूल: {formatINR(stats.totalRecovered)}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">बकाया पेशगी:</span>
                  <span
                    className={`font-black text-xs ${
                      stats.remainingBalance > 0 ? 'text-amber-900' : 'text-slate-400'
                    }`}
                  >
                    {formatINR(stats.remainingBalance)}
                  </span>
                </div>
              </div>
            );
          })}
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
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
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
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advance Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            पेशगी लेन-देन सूची ({filteredAdvances.length} रिकॉर्ड्स)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-left">
                <th className="p-3">तारीख (Date)</th>
                <th className="p-3">कर्मचारी का नाम</th>
                <th className="p-3 text-right">पेशगी राशि (Amount ₹)</th>
                <th className="p-3">कारण / विवरण (Note)</th>
                <th className="p-3 text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    कोई पेशगी रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                filteredAdvances.map((adv) => {
                  const empName = employeeMap.get(adv.employeeId) || 'Unknown Employee';
                  return (
                    <tr key={adv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">
                        {formatDateDDMMYYYY(adv.date)}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{empName}</td>
                      <td className="p-3 text-right font-black text-amber-900 text-sm">
                        {formatINR(adv.amount)}
                      </td>
                      <td className="p-3 text-slate-600">{adv.note || '-'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDelete(adv)}
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
        <AddAdvanceModal
          onClose={() => setShowAddModal(false)}
          initialEmployeeId={filterEmployeeId !== 'all' ? filterEmployeeId : undefined}
        />
      )}
    </div>
  );
};
