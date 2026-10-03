import React, { useState } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { AttendanceStatus } from '../../types';
import { getTodayYYYYMMDD, formatDateDDMMYYYY } from '../../utils/formatters';
import { X, CalendarCheck, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  initialDate?: string;
}

export const MarkAttendanceModal: React.FC<Props> = ({ onClose, initialDate }) => {
  const { state, batchMarkAttendance } = usePayroll();
  const [date, setDate] = useState<string>(initialDate || getTodayYYYYMMDD());

  // Existing attendance on this date
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>(() => {
    const map: Record<string, AttendanceStatus> = {};
    const existing = state.attendance.filter((a) => a.date === (initialDate || getTodayYYYYMMDD()));
    const existingMap = new Map(existing.map((e) => [e.employeeId, e.status]));

    state.employees.forEach((emp) => {
      map[emp.id] = (existingMap.get(emp.id) as AttendanceStatus) || 'present';
    });
    return map;
  });

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const existing = state.attendance.filter((a) => a.date === newDate);
    const existingMap = new Map(existing.map((e) => [e.employeeId, e.status]));
    const map: Record<string, AttendanceStatus> = {};
    state.employees.forEach((emp) => {
      map[emp.id] = (existingMap.get(emp.id) as AttendanceStatus) || 'present';
    });
    setStatusMap(map);
  };

  const handleSetStatus = (empId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [empId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    state.employees.forEach((emp) => {
      updated[emp.id] = status;
    });
    setStatusMap(updated);
  };

  const handleSave = () => {
    const records = Object.entries(statusMap).map(([employeeId, status]) => ({
      employeeId,
      status,
    }));
    batchMarkAttendance(date, records);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-lg">दैनिक हाजिरी लगाएं (Mark Attendance)</h3>
              <p className="text-xs text-slate-300">तारीख चुनें और उपस्थिति दर्ज करें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector & Bulk Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">तारीख (Date):</span>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500"
            />
            <span className="text-xs text-slate-500 font-medium">
              ({formatDateDDMMYYYY(date)})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleMarkAll('present')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
            >
              ✓ सबको उपस्थित (All Present)
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('leave')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
            >
              सबको छुट्टी (All Leave)
            </button>
          </div>
        </div>

        {/* Employee List */}
        <div className="p-4 sm:p-6 max-h-[55vh] overflow-y-auto space-y-3">
          {state.employees.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              कोई कर्मचारी नहीं मिला। पहले कर्मचारी जोड़ें।
            </div>
          ) : (
            state.employees.map((emp) => {
              const currentStatus = statusMap[emp.id] || 'present';
              return (
                <div
                  key={emp.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition gap-2"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{emp.name}</h4>
                    <p className="text-xs text-slate-500">
                      {emp.fatherName ? `पिता: ${emp.fatherName}` : ''}{' '}
                      {emp.village ? `• ${emp.village}` : ''}{' '}
                      • <span className="font-medium text-slate-700">{emp.salaryType === 'monthly' ? 'मासिक' : 'दैनिक'}</span>
                    </p>
                  </div>

                  {/* 4 Status Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 sm:w-80">
                    <button
                      type="button"
                      onClick={() => handleSetStatus(emp.id, 'present')}
                      className={`py-1.5 px-2 text-xs font-bold rounded-lg transition border text-center ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50/50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      P • उपस्थित
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetStatus(emp.id, 'absent')}
                      className={`py-1.5 px-2 text-xs font-bold rounded-lg transition border text-center ${
                        currentStatus === 'absent'
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : 'bg-rose-50/50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      A • गैरहाजिर
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetStatus(emp.id, 'leave')}
                      className={`py-1.5 px-2 text-xs font-bold rounded-lg transition border text-center ${
                        currentStatus === 'leave'
                          ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                          : 'bg-amber-50/50 border-amber-200 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      L • छुट्टी
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetStatus(emp.id, 'half_day')}
                      className={`py-1.5 px-2 text-xs font-bold rounded-lg transition border text-center ${
                        currentStatus === 'half_day'
                          ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                          : 'bg-sky-50/50 border-sky-200 text-sky-800 hover:bg-sky-100'
                      }`}
                    >
                      HD • आधा
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            डिफ़ॉल्ट उपस्थिति: <span className="font-semibold text-emerald-700">Present (उपस्थित)</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              रद्द करें
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition"
            >
              हाजिरी सेव करें (Save Attendance)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
