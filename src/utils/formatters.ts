/**
 * Indian Rupee & Date formatting utilities for Ranisa Payroll Pro
 */

export const formatINR = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  // Standard Indian numbering formatting (e.g. 1,25,000)
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}₹${formatted}`;
};

export const formatNumberOnly = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
};

/**
 * Format YYYY-MM-DD or ISO string to DD/MM/YYYY
 */
export const formatDateDDMMYYYY = (dateString: string | undefined | null): string => {
  if (!dateString) return '';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

/**
 * Get current date as YYYY-MM-DD
 */
export const getTodayYYYYMMDD = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get current month as YYYY-MM
 */
export const getCurrentYYYYMM = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const HINDI_MONTHS = [
  'जनवरी (January)',
  'फ़रवरी (February)',
  'मार्च (March)',
  'अप्रैल (April)',
  'मई (May)',
  'जून (June)',
  'जुलाई (July)',
  'अगस्त (August)',
  'सितंबर (September)',
  'अक्टूबर (October)',
  'नवंबर (November)',
  'दिसंबर (December)',
];

export const getMonthLabel = (yearMonth: string): string => {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const monthIdx = parseInt(month, 10) - 1;
  const hindiName = HINDI_MONTHS[monthIdx] || yearMonth;
  return `${hindiName} ${year}`;
};

/**
 * Returns array of days for a given YYYY-MM: [{ dayNumber: 1, date: 'YYYY-MM-01', dayOfWeek: 'Sat', isSunday: false }, ...]
 */
export interface MonthDayInfo {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  dayOfWeekShort: string;
  dayOfWeekHindi: string;
  isSunday: boolean;
}

export const getDaysInMonthInfo = (yearMonth: string): MonthDayInfo[] => {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-indexed

  // Total days in month: date with day 0 of next month
  const totalDays = new Date(year, month, 0).getDate();

  const days: MonthDayInfo[] = [];
  const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdaysHindi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

  for (let d = 1; d <= totalDays; d++) {
    const dayStr = String(d).padStart(2, '0');
    const fullDate = `${yearStr}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay();

    days.push({
      dayNumber: d,
      date: fullDate,
      dayOfWeekShort: weekdaysShort[dayOfWeek],
      dayOfWeekHindi: weekdaysHindi[dayOfWeek],
      isSunday: dayOfWeek === 0,
    });
  }

  return days;
};

/**
 * Generate a unique ID (internal only)
 */
export const generateId = (prefix = 'rec'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
