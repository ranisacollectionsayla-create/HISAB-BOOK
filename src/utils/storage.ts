import { PayrollAppState, ShopSettings, Employee, AttendanceRecord, AdvanceRecord, CommissionRecord, SalaryPaymentRecord, SalaryAdjustmentRecord } from '../types';
import { getCurrentYYYYMM, getTodayYYYYMMDD } from './formatters';

const STORAGE_KEY = 'ranisa_payroll_pro_data_v1';

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'Ranisa Collection Sayla',
  shopSubtitle: 'Simple Employee Salary & Attendance Management',
  ownerName: 'Ranisa Textiles',
  phone: '+91 98290 12345',
  address: 'Main Cloth Market, Station Road, Sayla, Rajasthan',
  monthDivisorType: 'actual_days',
  leaveDeductionType: 'unpaid',
  halfDayMultiplier: 0.5,
  autoRecoverAdvanceInSalary: true,
};

export const getDemoData = (): PayrollAppState => {
  const currentMonth = getCurrentYYYYMM();
  const today = getTodayYYYYMMDD();
  const [yearStr, monthStr] = currentMonth.split('-');
  const prevMonth = `${yearStr}-${String(Math.max(1, parseInt(monthStr, 10) - 1)).padStart(2, '0')}`;

  const employees: Employee[] = [
    {
      id: 'emp_1',
      name: 'Mahendra Singh',
      fatherName: 'Bhanwar Singh',
      mobileNumber: '9829012345',
      village: 'Sayla',
      joiningDate: '2024-01-15',
      salaryType: 'monthly',
      salaryAmount: 18000,
      commissionEnabled: true,
      commissionPercentage: 1.0,
      status: 'active',
      notes: 'Head Master Cutter & Fitting Specialist',
      createdAt: '2024-01-15T10:00:00.000Z',
    },
    {
      id: 'emp_2',
      name: 'Prakash Solanki',
      fatherName: 'Jaswant Solanki',
      mobileNumber: '9414567890',
      village: 'Jalore',
      joiningDate: '2024-03-01',
      salaryType: 'monthly',
      salaryAmount: 14000,
      commissionEnabled: true,
      commissionPercentage: 1.5,
      status: 'active',
      notes: 'Counter Sales & Suit-Lehenga Incharge',
      createdAt: '2024-03-01T10:00:00.000Z',
    },
    {
      id: 'emp_3',
      name: 'Rekha Devi',
      fatherName: 'Mohan Lal',
      mobileNumber: '9784321098',
      village: 'Sayla',
      joiningDate: '2024-06-10',
      salaryType: 'monthly',
      salaryAmount: 10000,
      commissionEnabled: false,
      commissionPercentage: 0,
      status: 'active',
      notes: 'Alteration, Ironing & Packaging Staff',
      createdAt: '2024-06-10T10:00:00.000Z',
    },
    {
      id: 'emp_4',
      name: 'Ramesh Kumar',
      fatherName: 'Shravan Kumar',
      mobileNumber: '9636541287',
      village: 'Bagra',
      joiningDate: '2024-09-01',
      salaryType: 'daily',
      salaryAmount: 500,
      commissionEnabled: false,
      commissionPercentage: 0,
      status: 'active',
      notes: 'Daily helper & store boy',
      createdAt: '2024-09-01T10:00:00.000Z',
    },
  ];

  // Attendance for current month
  const attendance: AttendanceRecord[] = [
    // Mahendra: took 1 leave on the 4th, 1 half day on the 10th
    { id: 'att_1', employeeId: 'emp_1', date: `${currentMonth}-04`, status: 'leave', note: 'Village function' },
    { id: 'att_2', employeeId: 'emp_1', date: `${currentMonth}-10`, status: 'half_day', note: 'Doctor visit afternoon' },
    // Prakash: absent on 2nd, half day on 12th
    { id: 'att_3', employeeId: 'emp_2', date: `${currentMonth}-02`, status: 'absent', note: 'Without intimation' },
    { id: 'att_4', employeeId: 'emp_2', date: `${currentMonth}-12`, status: 'half_day', note: 'Personal work' },
    // Rekha: 1 leave
    { id: 'att_5', employeeId: 'emp_3', date: `${currentMonth}-08`, status: 'leave', note: 'Family festival' },
    // Ramesh: 2 absents
    { id: 'att_6', employeeId: 'emp_4', date: `${currentMonth}-05`, status: 'absent', note: 'Harvesting work' },
    { id: 'att_7', employeeId: 'emp_4', date: `${currentMonth}-15`, status: 'absent', note: 'Bus missed' },
  ];

  // Advances (उधार / पेशगी)
  const advances: AdvanceRecord[] = [
    {
      id: 'adv_1',
      employeeId: 'emp_1',
      date: `${currentMonth}-03`,
      amount: 2000,
      note: 'Kids school fees advance',
      recoveredAmount: 1000,
      createdAt: `${currentMonth}-03T11:00:00.000Z`,
    },
    {
      id: 'adv_2',
      employeeId: 'emp_2',
      date: `${currentMonth}-07`,
      amount: 1500,
      note: 'Bike repair advance',
      recoveredAmount: 1500,
      createdAt: `${currentMonth}-07T14:30:00.000Z`,
    },
    {
      id: 'adv_3',
      employeeId: 'emp_4',
      date: `${currentMonth}-11`,
      amount: 800,
      note: 'Ration purchase advance',
      recoveredAmount: 0,
      createdAt: `${currentMonth}-11T09:00:00.000Z`,
    },
  ];

  // Sales commissions (बिक्री कमीशन)
  const commissions: CommissionRecord[] = [
    {
      id: 'comm_1',
      employeeId: 'emp_2',
      date: `${currentMonth}-05`,
      salesAmount: 45000,
      commissionPercentage: 1.5,
      commissionAmount: 675,
      type: 'daily',
      note: 'Bridal Rajputi Poshak sales',
      createdAt: `${currentMonth}-05T19:00:00.000Z`,
    },
    {
      id: 'comm_2',
      employeeId: 'emp_2',
      date: `${currentMonth}-12`,
      salesAmount: 62000,
      commissionPercentage: 1.5,
      commissionAmount: 930,
      type: 'daily',
      note: 'Saree & Chaniya Choli festive bulk sale',
      createdAt: `${currentMonth}-12T20:00:00.000Z`,
    },
    {
      id: 'comm_3',
      employeeId: 'emp_1',
      date: `${currentMonth}-14`,
      salesAmount: 35000,
      commissionPercentage: 1.0,
      commissionAmount: 350,
      type: 'daily',
      note: 'Designer Kurti order stitching commission',
      createdAt: `${currentMonth}-14T18:00:00.000Z`,
    },
  ];

  // Payments (वेतन भुगतान)
  const payments: SalaryPaymentRecord[] = [
    {
      id: 'pay_1',
      employeeId: 'emp_1',
      paymentDate: `${currentMonth}-15`,
      salaryMonth: currentMonth,
      amountPaid: 8000,
      paymentMode: 'upi',
      note: 'Mid-month partial salary payment via GPay',
      createdAt: `${currentMonth}-15T16:00:00.000Z`,
    },
    {
      id: 'pay_2',
      employeeId: 'emp_2',
      paymentDate: `${currentMonth}-15`,
      salaryMonth: currentMonth,
      amountPaid: 6000,
      paymentMode: 'cash',
      note: 'Cash token payment',
      createdAt: `${currentMonth}-15T18:00:00.000Z`,
    },
    {
      id: 'pay_3',
      employeeId: 'emp_3',
      paymentDate: `${currentMonth}-16`,
      salaryMonth: currentMonth,
      amountPaid: 5000,
      paymentMode: 'bank',
      note: 'Bank NEFT partial salary',
      createdAt: `${currentMonth}-16T11:00:00.000Z`,
    },
  ];

  // Salary adjustments
  const adjustments: SalaryAdjustmentRecord[] = [
    {
      id: 'adj_1',
      employeeId: 'emp_1',
      month: currentMonth,
      adjustmentAmount: 500, // Festive bonus
      advanceDeducted: 1000,
      reason: 'Diwali shop cleaning bonus (+500), Advance deducted (-1000)',
    },
    {
      id: 'adj_2',
      employeeId: 'emp_2',
      month: currentMonth,
      adjustmentAmount: 0,
      advanceDeducted: 1500,
      reason: 'Full bike advance recovered in this month',
    },
  ];

  return {
    employees,
    attendance,
    advances,
    commissions,
    payments,
    adjustments,
    settings: DEFAULT_SETTINGS,
  };
};

export const loadStoredData = (): PayrollAppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDemoData();
      saveStoredData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as PayrollAppState;
    // Ensure all keys exist
    return {
      employees: parsed.employees || [],
      attendance: parsed.attendance || [],
      advances: parsed.advances || [],
      commissions: parsed.commissions || [],
      payments: parsed.payments || [],
      adjustments: parsed.adjustments || [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
    };
  } catch (err) {
    console.error('Failed to load payroll state from localStorage:', err);
    return getDemoData();
  }
};

export const saveStoredData = (data: PayrollAppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save payroll state to localStorage:', err);
  }
};

export const clearStoredData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const exportBackupJSON = (data: PayrollAppState): void => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = getTodayYYYYMMDD();
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `ranisa_payroll_pro_backup_${dateStr}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
