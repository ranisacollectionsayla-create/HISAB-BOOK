import React from 'react';
import { usePayroll } from '../context/PayrollContext';
import {
  formatINR,
  getTodayYYYYMMDD,
  getMonthLabel,
  formatDateDDMMYYYY,
} from '../utils/formatters';
import { calculateEmployeeMonthlySummary } from '../utils/salaryCalculator';
import {
  Users,
  UserCheck,
  UserX,
  IndianRupee,
  CreditCard,
  HandCoins,
  Scale,
  TrendingUp,
  PlusCircle,
  Clock,
  FileBarChart2,
  Calendar,
  ArrowRight,
  Receipt,
  Store,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    state,
    selectedMonth,
    setSelectedMonth,
    setActiveTab,
    setQuickModal,
    setSelectedEmployeeForProfile,
    setSelectedPaymentVoucher,
    setSelectedSalarySlipSummary,
  } = usePayroll();

  const today = getTodayYYYYMMDD();

  // 1. Total Employees
  const totalEmployees = state.employees.length;

  // 2. Today's Attendance breakdown
  const todayAttendance = state.attendance.filter((a) => a.date === today);
  const todayAttMap = new Map(todayAttendance.map((a) => [a.employeeId, a.status]));

  let presentToday = 0;
  let absentToday = 0;
  state.employees.forEach((emp) => {
    const st = todayAttMap.get(emp.id) || 'present';
    if (st === 'present') presentToday++;
    else if (st === 'absent') absentToday++;
    else if (st === 'half_day') presentToday += 0.5;
  });

  // 3. Monthly summaries
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

  const totalMonthlySalary = summaries.reduce((sum, s) => sum + s.netSalary, 0);
  const totalPaidSalary = summaries.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalBalanceDue = summaries.reduce((sum, s) => sum + Math.max(0, s.balanceDue), 0);
  const totalCommission = summaries.reduce((sum, s) => sum + s.commissionAmount, 0);

  // Total Advance given (for this month or all-time pending)
  const totalAdvance = state.advances
    .filter((a) => a.date.startsWith(selectedMonth))
    .reduce((sum, a) => sum + a.amount, 0);

  // All-time pending advance
  const totalPendingAdvanceAllTime = state.employees.reduce((sum, emp) => {
    const empAdv = state.advances
      .filter((a) => a.employeeId === emp.id)
      .reduce((s, a) => s + a.amount, 0);
    const empRec = state.adjustments
      .filter((adj) => adj.employeeId === emp.id)
      .reduce((s, adj) => s + adj.advanceDeducted, 0);
    return sum + Math.max(0, empAdv - empRec);
  }, 0);

  // Recent activity stream: mix payments, advances, commissions, sorted by date/time
  interface ActivityItem {
    id: string;
    type: 'payment' | 'advance' | 'commission' | 'employee';
    title: string;
    subtitle: string;
    amount?: number;
    date: string;
    rawItem: any;
  }

  const activities: ActivityItem[] = [];

  state.payments.slice(0, 10).forEach((p) => {
    const emp = state.employees.find((e) => e.id === p.employeeId);
    activities.push({
      id: p.id,
      type: 'payment',
      title: `${emp?.name || 'Employee'} को वेतन भुगतान`,
      subtitle: `${p.paymentMode.toUpperCase()} द्वारा • माह: ${getMonthLabel(p.salaryMonth)}`,
      amount: p.amountPaid,
      date: p.paymentDate,
      rawItem: p,
    });
  });

  state.advances.slice(0, 8).forEach((a) => {
    const emp = state.employees.find((e) => e.id === a.employeeId);
    activities.push({
      id: a.id,
      type: 'advance',
      title: `${emp?.name || 'Employee'} को पेशगी (Advance)`,
      subtitle: a.note || 'दुकान से अग्रिम राशि',
      amount: a.amount,
      date: a.date,
      rawItem: a,
    });
  });

  state.commissions.slice(0, 8).forEach((c) => {
    const emp = state.employees.find((e) => e.id === c.employeeId);
    activities.push({
      id: c.id,
      type: 'commission',
      title: `${emp?.name || 'Employee'} का बिक्री कमीशन`,
      subtitle: `बिक्री ${formatINR(c.salesAmount)} पर ${c.commissionPercentage}%`,
      amount: c.commissionAmount,
      date: c.date,
      rawItem: c,
    });
  });

  // Sort activities newest first
  activities.sort((a, b) => b.date.localeCompare(a.date));
  const recentActivities = activities.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Month Selector & Store Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold tracking-wider uppercase mb-1">
            <Store className="w-4 h-4" />
            {state.settings.shopName || 'Ranisa Collection Sayla'}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            पेरोल डैशबोर्ड (Payroll Dashboard)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            कर्मचारियों का वेतन, हाजिरी, पेशगी और कमीशन का संपूर्ण हिसाब
          </p>
        </div>

        {/* Month selector */}
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-rose-300" />
          <span className="text-xs text-slate-200 font-medium">महीना:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white text-slate-900 text-xs sm:text-sm font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* 8 Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Employees */}
        <div
          onClick={() => setActiveTab('employees')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Employees</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalEmployees}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">कुल कर्मचारी (Active)</div>
        </div>

        {/* Card 2: Present Today */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Present Today</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{presentToday}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">आज उपस्थित (Present)</div>
        </div>

        {/* Card 3: Absent Today */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Absent Today</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700">{absentToday}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">आज अनुपस्थित (Absent)</div>
        </div>

        {/* Card 4: Total Monthly Salary */}
        <div
          onClick={() => setActiveTab('salary')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Net Salary</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800 group-hover:scale-110 transition">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{formatINR(totalMonthlySalary)}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">इस महीने का कुल शुद्ध वेतन</div>
        </div>

        {/* Card 5: Total Paid Salary */}
        <div
          onClick={() => setActiveTab('payments')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Paid Salary</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{formatINR(totalPaidSalary)}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">चुकाया गया कुल वेतन</div>
        </div>

        {/* Card 6: Total Advance */}
        <div
          onClick={() => setActiveTab('advance')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Advance</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-110 transition">
              <HandCoins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900">{formatINR(totalAdvance)}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">
            इस महीने दी गई पेशगी (कुल बाकी {formatINR(totalPendingAdvanceAllTime)})
          </div>
        </div>

        {/* Card 7: Total Balance Due */}
        <div
          onClick={() => setActiveTab('salary')}
          className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs hover:shadow-md transition cursor-pointer group bg-gradient-to-br from-white to-rose-50/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Total Balance Due</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 group-hover:scale-110 transition">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-800">{formatINR(totalBalanceDue)}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">कुल बाकी वेतन (बकाया)</div>
        </div>

        {/* Card 8: Total Commission */}
        <div
          onClick={() => setActiveTab('commission')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Commission</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-900">{formatINR(totalCommission)}</div>
          <div className="text-[11px] text-indigo-700 font-medium mt-0.5">कुल बिक्री कमीशन</div>
        </div>
      </div>

      {/* Quick Action Buttons Row (Mandatory Requirement #1) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          त्वरित बटन (Quick Action Buttons)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Quick 1: Add Employee */}
          <button
            onClick={() => setQuickModal('add_employee')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-800 font-bold transition text-xs shadow-2xs group"
          >
            <PlusCircle className="w-6 h-6 mb-1.5 text-rose-600 group-hover:scale-110 transition" />
            <span>+ नया कर्मचारी</span>
            <span className="text-[10px] text-rose-600 font-normal">Add Employee</span>
          </button>

          {/* Quick 2: Mark Attendance */}
          <button
            onClick={() => setQuickModal('mark_attendance')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 font-bold transition text-xs shadow-2xs group"
          >
            <Clock className="w-6 h-6 mb-1.5 text-emerald-600 group-hover:scale-110 transition" />
            <span>हाजिरी लगाएं</span>
            <span className="text-[10px] text-emerald-600 font-normal">Mark Attendance</span>
          </button>

          {/* Quick 3: Salary Payment */}
          <button
            onClick={() => setQuickModal('salary_payment')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-800 font-bold transition text-xs shadow-2xs group"
          >
            <CreditCard className="w-6 h-6 mb-1.5 text-blue-600 group-hover:scale-110 transition" />
            <span>वेतन भुगतान</span>
            <span className="text-[10px] text-blue-600 font-normal">Salary Payment</span>
          </button>

          {/* Quick 4: Add Advance */}
          <button
            onClick={() => setQuickModal('add_advance')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-800 font-bold transition text-xs shadow-2xs group"
          >
            <HandCoins className="w-6 h-6 mb-1.5 text-amber-600 group-hover:scale-110 transition" />
            <span>पेशगी दें (Advance)</span>
            <span className="text-[10px] text-amber-700 font-normal">Add Advance</span>
          </button>

          {/* Quick 5: Add Sales/Commission */}
          <button
            onClick={() => setQuickModal('add_commission')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-800 font-bold transition text-xs shadow-2xs group"
          >
            <TrendingUp className="w-6 h-6 mb-1.5 text-indigo-600 group-hover:scale-110 transition" />
            <span>बिक्री / कमीशन</span>
            <span className="text-[10px] text-indigo-600 font-normal">Add Commission</span>
          </button>

          {/* Quick 6: Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 font-bold transition text-xs shadow-2xs group"
          >
            <FileBarChart2 className="w-6 h-6 mb-1.5 text-purple-600 group-hover:scale-110 transition" />
            <span>रिपोर्ट्स व एक्सपोर्ट</span>
            <span className="text-[10px] text-purple-600 font-normal">Reports</span>
          </button>
        </div>
      </div>

      {/* Split Section: Monthly Salary Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Salary Snapshot Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {getMonthLabel(selectedMonth)} - वेतन स्थिति
              </h3>
              <p className="text-xs text-slate-500">
                सभी कर्मचारियों का इस महीने का वेतन व बाकी विवरण
              </p>
            </div>
            <button
              onClick={() => setActiveTab('salary')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              पूरा पत्रक देखें <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-left">
                  <th className="pb-2.5">कर्मचारी (Employee)</th>
                  <th className="pb-2.5 text-center">उपस्थित दिन</th>
                  <th className="pb-2.5 text-right">कुल वेतन</th>
                  <th className="pb-2.5 text-right">भुगतान हुआ</th>
                  <th className="pb-2.5 text-right">बाकी (Balance)</th>
                  <th className="pb-2.5 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summaries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      कोई कर्मचारी नहीं मिला। कृपया कर्मचारी जोड़ें।
                    </td>
                  </tr>
                ) : (
                  summaries.map((s) => (
                    <tr key={s.employee.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-900">
                        <button
                          onClick={() => setSelectedEmployeeForProfile(s.employee)}
                          className="hover:text-rose-600 text-left"
                        >
                          <div>{s.employee.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {s.employee.fatherName ? `पिता: ${s.employee.fatherName}` : ''}{' '}
                            {s.employee.village ? `• ${s.employee.village}` : ''}
                          </div>
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-bold text-slate-800">{s.payableDays}</span>
                        <span className="text-slate-400">/{s.daysInMonth}</span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        {formatINR(s.netSalary)}
                      </td>
                      <td className="py-3 text-right font-bold text-emerald-700">
                        {formatINR(s.totalPaid)}
                      </td>
                      <td className="py-3 text-right font-extrabold text-rose-700">
                        {formatINR(s.balanceDue)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedSalarySlipSummary(s)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-[11px] transition"
                        >
                          पर्ची
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Activity Section (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              हाल की गतिविधियाँ (Recent Activity)
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">लाइव रिकॉर्ड</span>
          </div>

          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                अभी तक कोई गतिविधि नहीं हुई है।
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start space-x-2.5">
                    <div
                      className={`p-1.5 rounded-lg mt-0.5 ${
                        act.type === 'payment'
                          ? 'bg-emerald-100 text-emerald-800'
                          : act.type === 'advance'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {act.type === 'payment' ? (
                        <CreditCard className="w-3.5 h-3.5" />
                      ) : act.type === 'advance' ? (
                        <HandCoins className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{act.title}</div>
                      <div className="text-[11px] text-slate-500">{act.subtitle}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatDateDDMMYYYY(act.date)}
                      </div>
                    </div>
                  </div>

                  {act.amount !== undefined && (
                    <div
                      className={`text-xs font-black ${
                        act.type === 'payment'
                          ? 'text-emerald-700'
                          : act.type === 'advance'
                          ? 'text-amber-800'
                          : 'text-indigo-700'
                      }`}
                    >
                      {formatINR(act.amount)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
