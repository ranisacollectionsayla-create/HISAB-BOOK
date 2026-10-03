import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { AttendanceStatus } from '../types';
import {
  getMonthLabel,
  getDaysInMonthInfo,
  formatDateDDMMYYYY,
  getTodayYYYYMMDD,
} from '../utils/formatters';
import { exportAttendanceReportToExcel } from '../utils/excelExport';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { MarkAttendanceModal } from './Modals/MarkAttendanceModal';

export const Attendance: React.FC = () => {
  const { state, selectedMonth, setSelectedMonth, markAttendance } = usePayroll();
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('all');

  const daysInfo = getDaysInMonthInfo(selectedMonth);
  const today = getTodayYYYYMMDD();

  // Create an attendance lookup map: `${empId}_${date}` -> AttendanceRecord
  const attLookup = new Map<string, AttendanceStatus>();
  state.attendance.forEach((a) => {
    attLookup.set(`${a.employeeId}_${a.date}`, a.status);
  });

  // Cycle status on cell click: present -> absent -> leave -> half_day -> present
  const cycleStatus = (current: AttendanceStatus): AttendanceStatus => {
    switch (current) {
      case 'present':
        return 'absent';
      case 'absent':
        return 'leave';
      case 'leave':
        return 'half_day';
      case 'half_day':
        return 'present';
      default:
        return 'present';
    }
  };

  const handleCellClick = (employeeId: string, date: string) => {
    const current = attLookup.get(`${employeeId}_${date}`) || 'present';
    const next = cycleStatus(current);
    markAttendance(employeeId, date, next);
  };

  // Previous & Next Month Navigation
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

  const filteredEmployees =
    filterEmployeeId === 'all'
      ? state.employees
      : state.employees.filter((e) => e.id === filterEmployeeId);

  // Status visual pill
  const renderStatusPill = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="w-6 h-6 inline-flex items-center justify-center rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
            P
          </span>
        );
      case 'absent':
        return (
          <span className="w-6 h-6 inline-flex items-center justify-center rounded-md bg-rose-100 text-rose-800 font-bold text-xs">
            A
          </span>
        );
      case 'leave':
        return (
          <span className="w-6 h-6 inline-flex items-center justify-center rounded-md bg-amber-100 text-amber-900 font-bold text-xs">
            L
          </span>
        );
      case 'half_day':
        return (
          <span className="w-6 h-6 inline-flex items-center justify-center rounded-md bg-sky-100 text-sky-800 font-bold text-xs">
            ½
          </span>
        );
      default:
        return (
          <span className="w-6 h-6 inline-flex items-center justify-center rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
            P
          </span>
        );
    }
  };

  // Export Attendance Sheet
  const handleExportAttendance = () => {
    const rows: Array<{
      date: string;
      employeeName: string;
      status: string;
      note?: string;
    }> = [];

    daysInfo.forEach((day) => {
      filteredEmployees.forEach((emp) => {
        const st = attLookup.get(`${emp.id}_${day.date}`) || 'present';
        const stLabel =
          st === 'present'
            ? 'Present (उपस्थित)'
            : st === 'absent'
            ? 'Absent (अनुपस्थित)'
            : st === 'leave'
            ? 'Leave (छुट्टी)'
            : 'Half Day (आधा दिन)';
        rows.push({
          date: day.date,
          employeeName: emp.name,
          status: stLabel,
        });
      });
    });

    exportAttendanceReportToExcel(
      rows,
      `Ranisa_Attendance_${selectedMonth}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">
              मासिक हाजिरी रजिस्टर (Attendance Management)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            क्लिक करके हाजिरी बदलें: Present (P) → Absent (A) → Leave (L) → Half Day (½)
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
              title="Previous Month"
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
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportAttendance}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1 text-emerald-600" />
            Excel
          </button>

          <button
            onClick={() => setShowMarkModal(true)}
            className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition"
          >
            <Clock className="w-4 h-4 mr-1.5" />
            आज की हाजिरी (Mark Today)
          </button>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-slate-700">संकेत (Legend):</span>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              P
            </span>
            <span className="text-slate-600">Present (उपस्थित)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
              A
            </span>
            <span className="text-slate-600">Absent (अनुपस्थित)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded bg-amber-100 text-amber-900 font-bold text-[11px]">
              L
            </span>
            <span className="text-slate-600">Leave (छुट्टी)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded bg-sky-100 text-sky-800 font-bold text-[11px]">
              ½
            </span>
            <span className="text-slate-600">Half Day (आधा दिन)</span>
          </div>
        </div>

        {/* Filter Employee */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterEmployeeId}
            onChange={(e) => setFilterEmployeeId(e.target.value)}
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
      </div>

      {/* Monthly Attendance Calendar Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900">
            {getMonthLabel(selectedMonth)} • उपस्थिति कैलेंडर
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            कुल दिन: {daysInfo.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3 text-left min-w-[160px] sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                  कर्मचारी का नाम
                </th>
                {daysInfo.map((day) => {
                  const isToday = day.date === today;
                  return (
                    <th
                      key={day.dayNumber}
                      className={`p-1.5 text-center min-w-[34px] border-r border-slate-200 ${
                        day.isSunday ? 'bg-rose-50/70 text-rose-700' : ''
                      } ${isToday ? 'bg-emerald-50 text-emerald-800 font-black ring-1 ring-emerald-300' : ''}`}
                    >
                      <div className="text-[10px] uppercase font-semibold text-slate-400">
                        {day.dayOfWeekHindi}
                      </div>
                      <div className="text-xs font-bold">{day.dayNumber}</div>
                    </th>
                  );
                })}
                <th className="p-2 text-center bg-emerald-50 text-emerald-800 border-r border-slate-200 min-w-[45px]">
                  P
                </th>
                <th className="p-2 text-center bg-rose-50 text-rose-800 border-r border-slate-200 min-w-[45px]">
                  A
                </th>
                <th className="p-2 text-center bg-amber-50 text-amber-800 border-r border-slate-200 min-w-[45px]">
                  L
                </th>
                <th className="p-2 text-center bg-sky-50 text-sky-800 border-r border-slate-200 min-w-[45px]">
                  ½
                </th>
                <th className="p-2 text-center bg-slate-200 text-slate-900 font-extrabold min-w-[60px]">
                  देय दिन
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={daysInfo.length + 6}
                    className="p-8 text-center text-slate-400"
                  >
                    कोई कर्मचारी नहीं मिला।
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  // Count totals for this month
                  let pCount = 0;
                  let aCount = 0;
                  let lCount = 0;
                  let hdCount = 0;

                  daysInfo.forEach((day) => {
                    const st = attLookup.get(`${emp.id}_${day.date}`) || 'present';
                    if (st === 'present') pCount++;
                    else if (st === 'absent') aCount++;
                    else if (st === 'leave') lCount++;
                    else if (st === 'half_day') hdCount++;
                  });

                  const payableDays = pCount + hdCount * 0.5;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      {/* Employee sticky cell */}
                      <td className="p-3 font-semibold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-xs">
                        <div className="font-bold">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {emp.salaryType === 'monthly' ? 'मासिक' : 'दैनिक'}
                        </div>
                      </td>

                      {/* Days cells */}
                      {daysInfo.map((day) => {
                        const status = attLookup.get(`${emp.id}_${day.date}`) || 'present';
                        const isToday = day.date === today;
                        return (
                          <td
                            key={day.dayNumber}
                            onClick={() => handleCellClick(emp.id, day.date)}
                            className={`p-1 text-center border-r border-slate-200 cursor-pointer select-none transition hover:scale-110 hover:z-20 ${
                              day.isSunday ? 'bg-rose-50/20' : ''
                            } ${isToday ? 'bg-emerald-50/40' : ''}`}
                            title={`${emp.name} - ${formatDateDDMMYYYY(day.date)}: ${status} (क्लिक करके बदलें)`}
                          >
                            {renderStatusPill(status)}
                          </td>
                        );
                      })}

                      {/* Monthly Summaries */}
                      <td className="p-2 text-center font-bold text-emerald-800 bg-emerald-50/50 border-r border-slate-200">
                        {pCount}
                      </td>
                      <td className="p-2 text-center font-bold text-rose-800 bg-rose-50/50 border-r border-slate-200">
                        {aCount}
                      </td>
                      <td className="p-2 text-center font-bold text-amber-800 bg-amber-50/50 border-r border-slate-200">
                        {lCount}
                      </td>
                      <td className="p-2 text-center font-bold text-sky-800 bg-sky-50/50 border-r border-slate-200">
                        {hdCount}
                      </td>
                      <td className="p-2 text-center font-black text-slate-900 bg-slate-100">
                        {payableDays}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Today's Attendance */}
      {showMarkModal && (
        <MarkAttendanceModal
          onClose={() => setShowMarkModal(false)}
          initialDate={today}
        />
      )}
    </div>
  );
};
