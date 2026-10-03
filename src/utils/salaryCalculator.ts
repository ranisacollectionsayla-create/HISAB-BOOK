import {
  Employee,
  AttendanceRecord,
  AdvanceRecord,
  CommissionRecord,
  SalaryPaymentRecord,
  SalaryAdjustmentRecord,
  ShopSettings,
  EmployeeMonthlySummary,
} from '../types';
import { getDaysInMonthInfo } from './formatters';

export interface SalaryRuleOptions {
  monthDivisorType: 'actual_days' | 'fixed_30' | 'fixed_26';
  leaveDeductionType: 'unpaid' | 'paid_all' | 'one_paid_leave_per_month';
  halfDayMultiplier: number; // default 0.5
}

/**
 * Calculate the divisor (number of working/total days) for monthly salary daily-rate calculation
 */
export const getMonthDivisor = (
  yearMonth: string,
  ruleType: 'actual_days' | 'fixed_30' | 'fixed_26' = 'actual_days'
): number => {
  if (ruleType === 'fixed_30') return 30;
  if (ruleType === 'fixed_26') return 26;

  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  return new Date(year, month, 0).getDate();
};

/**
 * Calculate single employee's monthly summary for a specific month (YYYY-MM)
 */
export const calculateEmployeeMonthlySummary = (
  employee: Employee,
  yearMonth: string,
  allAttendance: AttendanceRecord[],
  allAdvances: AdvanceRecord[],
  allCommissions: CommissionRecord[],
  allPayments: SalaryPaymentRecord[],
  allAdjustments: SalaryAdjustmentRecord[],
  settings: ShopSettings
): EmployeeMonthlySummary => {
  const daysInMonthInfo = getDaysInMonthInfo(yearMonth);
  const daysInMonth = daysInMonthInfo.length;

  // Filter attendance for this employee in this month
  const monthPrefix = `${yearMonth}-`;
  const empAttendance = allAttendance.filter(
    (att) => att.employeeId === employee.id && att.date.startsWith(monthPrefix)
  );

  // Group by status
  let presentDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let halfDays = 0;

  // In our system, default attendance is present unless marked otherwise.
  // We check each day in the month up to today or all days in the month
  const attMap = new Map<string, string>();
  empAttendance.forEach((a) => {
    attMap.set(a.date, a.status);
  });

  daysInMonthInfo.forEach((day) => {
    const status = attMap.get(day.date) || 'present';
    if (status === 'present') presentDays++;
    else if (status === 'absent') absentDays++;
    else if (status === 'leave') leaveDays++;
    else if (status === 'half_day') halfDays++;
  });

  // Calculate payable days according to rules
  const halfDayWeight = settings.halfDayMultiplier ?? 0.5;
  let paidLeaves = 0;
  if (settings.leaveDeductionType === 'paid_all') {
    paidLeaves = leaveDays;
  } else if (settings.leaveDeductionType === 'one_paid_leave_per_month') {
    paidLeaves = Math.min(leaveDays, 1);
  } else {
    // 'unpaid'
    paidLeaves = 0;
  }

  // Basic salary & Daily rate
  const divisor = getMonthDivisor(yearMonth, settings.monthDivisorType);
  let dailyRate = 0;
  let basicSalary = 0;
  let attendanceDeduction = 0;
  let grossSalary = 0;

  if (employee.salaryType === 'monthly') {
    basicSalary = employee.salaryAmount;
    dailyRate = divisor > 0 ? basicSalary / divisor : 0;

    // Unpaid leave days
    const unpaidLeaves = Math.max(0, leaveDays - paidLeaves);
    // Attendance deduction: (absentDays + unpaidLeaves + halfDays * (1 - halfDayWeight)) * dailyRate
    const lostDays = absentDays + unpaidLeaves + halfDays * (1 - halfDayWeight);
    attendanceDeduction = Math.round(lostDays * dailyRate);
    grossSalary = Math.max(0, Math.round(basicSalary - attendanceDeduction));
  } else {
    // Daily wage
    dailyRate = employee.salaryAmount;
    const payableDaysCount = presentDays + paidLeaves + halfDays * halfDayWeight;
    basicSalary = Math.round(dailyRate * daysInMonth); // Nominal base
    grossSalary = Math.round(dailyRate * payableDaysCount);
    attendanceDeduction = Math.round(Math.max(0, basicSalary - grossSalary));
  }

  const payableDays =
    presentDays + paidLeaves + halfDays * halfDayWeight;

  // Commissions for this employee in this month
  const empCommissions = allCommissions.filter(
    (c) => c.employeeId === employee.id && c.date.startsWith(monthPrefix)
  );
  const commissionAmount = empCommissions.reduce(
    (sum, c) => sum + (c.commissionAmount || 0),
    0
  );

  // Manual Adjustments & Advance deduction for this month
  const empAdjustment = allAdjustments.find(
    (adj) => adj.employeeId === employee.id && adj.month === yearMonth
  );
  const otherAdjustment = empAdjustment ? empAdjustment.adjustmentAmount : 0;
  const advanceDeducted = empAdjustment ? empAdjustment.advanceDeducted : 0;
  const adjustmentReason = empAdjustment?.reason;

  // Net salary = grossSalary + commissionAmount + otherAdjustment - advanceDeducted
  const netSalary = Math.max(
    0,
    grossSalary + commissionAmount + otherAdjustment - advanceDeducted
  );

  // Total paid for this month
  const empPayments = allPayments.filter(
    (p) => p.employeeId === employee.id && p.salaryMonth === yearMonth
  );
  const totalPaid = empPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  // Balance due
  const balanceDue = netSalary - totalPaid;

  return {
    employee,
    month: yearMonth,
    daysInMonth,
    presentDays,
    absentDays,
    leaveDays,
    halfDays,
    payableDays,
    basicSalary,
    dailyRate: Math.round(dailyRate),
    attendanceDeduction,
    commissionAmount,
    advanceDeducted,
    otherAdjustment,
    adjustmentReason,
    grossSalary,
    netSalary,
    totalPaid,
    balanceDue,
  };
};

/**
 * Calculate overall advance status for an employee:
 * Total advances given, total recovered (across all monthly salary adjustments), and current remaining balance
 */
export const calculateEmployeeAdvanceBalance = (
  employeeId: string,
  advances: AdvanceRecord[],
  adjustments: SalaryAdjustmentRecord[]
): { totalGiven: number; totalRecovered: number; remainingBalance: number } => {
  const empAdvances = advances.filter((a) => a.employeeId === employeeId);
  const totalGiven = empAdvances.reduce((sum, a) => sum + (a.amount || 0), 0);

  const empAdjustments = adjustments.filter((adj) => adj.employeeId === employeeId);
  const totalRecovered = empAdjustments.reduce(
    (sum, adj) => sum + (adj.advanceDeducted || 0),
    0
  );

  const remainingBalance = Math.max(0, totalGiven - totalRecovered);

  return {
    totalGiven,
    totalRecovered,
    remainingBalance,
  };
};
