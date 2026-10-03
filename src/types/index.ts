export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'half_day';

export type SalaryType = 'monthly' | 'daily';

export type PaymentMode = 'cash' | 'upi' | 'bank';

export interface Employee {
  id: string; // Internal unique ID (never displayed to user)
  name: string; // Employee Name (कर्मचारी का नाम)
  fatherName: string; // Father Name (पिता का नाम)
  mobileNumber: string; // Mobile Number (मोबाइल नंबर)
  village: string; // Village / City (गाँव / शहर)
  joiningDate: string; // YYYY-MM-DD
  salaryType: SalaryType; // 'daily' | 'monthly'
  salaryAmount: number; // Salary rate (वेतन दर ₹)
  commissionEnabled: boolean; // Yes / No
  commissionPercentage: number; // e.g. 1.5%
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
}

export interface AdvanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  note?: string;
  recoveredAmount?: number; // How much recovered so far
  createdAt: string;
}

export interface CommissionRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  salesAmount: number;
  commissionPercentage: number;
  commissionAmount: number; // Auto calculated
  type: 'daily' | 'monthly';
  note?: string;
  createdAt: string;
}

export interface SalaryPaymentRecord {
  id: string;
  employeeId: string;
  paymentDate: string; // YYYY-MM-DD
  salaryMonth: string; // YYYY-MM (e.g. "2026-10")
  amountPaid: number;
  paymentMode: PaymentMode;
  note?: string;
  createdAt: string;
}

export interface SalaryAdjustmentRecord {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM
  adjustmentAmount: number; // positive (bonus) or negative (penalty/other)
  advanceDeducted: number; // How much advance deducted this month
  reason?: string;
}

export interface ShopSettings {
  shopName: string;
  shopSubtitle: string;
  ownerName: string;
  phone: string;
  address: string;
  // Configurable Salary Rules
  monthDivisorType: 'actual_days' | 'fixed_30' | 'fixed_26';
  leaveDeductionType: 'unpaid' | 'paid_all' | 'one_paid_leave_per_month';
  halfDayMultiplier: number; // default 0.5
  autoRecoverAdvanceInSalary: boolean;
}

export interface EmployeeMonthlySummary {
  employee: Employee;
  month: string; // YYYY-MM
  daysInMonth: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  payableDays: number;
  basicSalary: number;
  dailyRate: number;
  attendanceDeduction: number;
  commissionAmount: number;
  advanceDeducted: number;
  otherAdjustment: number;
  adjustmentReason?: string;
  grossSalary: number;
  netSalary: number;
  totalPaid: number;
  balanceDue: number;
}

export interface PayrollAppState {
  employees: Employee[];
  attendance: AttendanceRecord[];
  advances: AdvanceRecord[];
  commissions: CommissionRecord[];
  payments: SalaryPaymentRecord[];
  adjustments: SalaryAdjustmentRecord[];
  settings: ShopSettings;
}
