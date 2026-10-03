import * as XLSX from 'xlsx';
import {
  Employee,
  AttendanceRecord,
  AdvanceRecord,
  CommissionRecord,
  SalaryPaymentRecord,
  EmployeeMonthlySummary,
} from '../types';
import { formatDateDDMMYYYY, formatINR } from './formatters';

/**
 * Export Monthly Salary Sheet to Excel
 */
export const exportSalarySheetToExcel = (
  summaries: EmployeeMonthlySummary[],
  monthLabel: string
) => {
  const data = summaries.map((s, index) => ({
    'S.No': index + 1,
    'Employee Name (कर्मचारी)': s.employee.name,
    'Father Name (पिता का नाम)': s.employee.fatherName || '-',
    'Salary Type': s.employee.salaryType === 'monthly' ? 'Monthly' : 'Daily',
    'Base Salary (₹)': s.basicSalary,
    'Present Days': s.presentDays,
    'Absent Days': s.absentDays,
    'Leave Days': s.leaveDays,
    'Half Days': s.halfDays,
    'Payable Days': s.payableDays,
    'Attendance Deduction (₹)': s.attendanceDeduction,
    'Commission (₹)': s.commissionAmount,
    'Advance Deducted (₹)': s.advanceDeducted,
    'Adjustment (₹)': s.otherAdjustment,
    'Net Salary (₹)': s.netSalary,
    'Paid (₹)': s.totalPaid,
    'Balance Due (₹)': s.balanceDue,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary Sheet');

  // Auto-size columns
  const maxWidths = [
    { wch: 6 },
    { wch: 22 },
    { wch: 20 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 20 },
    { wch: 15 },
    { wch: 18 },
    { wch: 14 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
  ];
  worksheet['!cols'] = maxWidths;

  const fileName = `Ranisa_Salary_Sheet_${monthLabel.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Export All Employees list
 */
export const exportEmployeesToExcel = (employees: Employee[]) => {
  const data = employees.map((emp, index) => ({
    'S.No': index + 1,
    'Employee Name (कर्मचारी)': emp.name,
    'Father Name (पिता का नाम)': emp.fatherName,
    'Mobile Number (मोबाइल)': emp.mobileNumber,
    'Village/City (गाँव/शहर)': emp.village,
    'Joining Date (शामिल तिथि)': formatDateDDMMYYYY(emp.joiningDate),
    'Salary Type (प्रकार)': emp.salaryType === 'monthly' ? 'Monthly' : 'Daily',
    'Salary Amount (वेतन दर ₹)': emp.salaryAmount,
    'Commission Enabled': emp.commissionEnabled ? 'Yes' : 'No',
    'Commission %': emp.commissionEnabled ? `${emp.commissionPercentage}%` : '0%',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
  XLSX.writeFile(workbook, 'Ranisa_Employees_List.xlsx');
};

/**
 * Export Attendance Report
 */
export const exportAttendanceReportToExcel = (
  rows: Array<{
    date: string;
    employeeName: string;
    status: string;
    note?: string;
  }>,
  title: string
) => {
  const data = rows.map((r, i) => ({
    'S.No': i + 1,
    'Date (तारीख)': formatDateDDMMYYYY(r.date),
    'Employee Name': r.employeeName,
    'Status (स्थिति)': r.status,
    'Note (टिप्पणी)': r.note || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}.xlsx`);
};

/**
 * Export Payments Report
 */
export const exportPaymentsToExcel = (
  payments: SalaryPaymentRecord[],
  employeeMap: Map<string, string>
) => {
  const data = payments.map((p, i) => ({
    'S.No': i + 1,
    'Payment Date': formatDateDDMMYYYY(p.paymentDate),
    'Employee Name': employeeMap.get(p.employeeId) || 'Unknown',
    'Salary Month': p.salaryMonth,
    'Amount Paid (₹)': p.amountPaid,
    'Mode (माध्यम)': p.paymentMode.toUpperCase(),
    'Note (टिप्पणी)': p.note || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
  XLSX.writeFile(workbook, 'Ranisa_Payments_Report.xlsx');
};

/**
 * Export Advances Report
 */
export const exportAdvancesToExcel = (
  advances: AdvanceRecord[],
  employeeMap: Map<string, string>
) => {
  const data = advances.map((a, i) => ({
    'S.No': i + 1,
    'Date': formatDateDDMMYYYY(a.date),
    'Employee Name': employeeMap.get(a.employeeId) || 'Unknown',
    'Advance Amount (₹)': a.amount,
    'Note (टिप्पणी)': a.note || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Advances');
  XLSX.writeFile(workbook, 'Ranisa_Advance_Report.xlsx');
};

/**
 * Export Commissions Report
 */
export const exportCommissionsToExcel = (
  commissions: CommissionRecord[],
  employeeMap: Map<string, string>
) => {
  const data = commissions.map((c, i) => ({
    'S.No': i + 1,
    'Date': formatDateDDMMYYYY(c.date),
    'Employee Name': employeeMap.get(c.employeeId) || 'Unknown',
    'Sales Amount (₹)': c.salesAmount,
    'Commission %': `${c.commissionPercentage}%`,
    'Commission Earned (₹)': c.commissionAmount,
    'Note': c.note || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Commissions');
  XLSX.writeFile(workbook, 'Ranisa_Commission_Report.xlsx');
};
