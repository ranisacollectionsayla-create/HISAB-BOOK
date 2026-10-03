import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Employee,
  AttendanceRecord,
  AdvanceRecord,
  CommissionRecord,
  SalaryPaymentRecord,
  SalaryAdjustmentRecord,
  ShopSettings,
  PayrollAppState,
  AttendanceStatus,
} from '../types';
import {
  loadStoredData,
  saveStoredData,
  getDemoData,
  clearStoredData,
  exportBackupJSON,
} from '../utils/storage';
import { getCurrentYYYYMM, generateId, getTodayYYYYMMDD } from '../utils/formatters';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PayrollContextType {
  state: PayrollAppState;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Employee methods
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Attendance methods
  markAttendance: (employeeId: string, date: string, status: AttendanceStatus, note?: string) => void;
  batchMarkAttendance: (date: string, records: Array<{ employeeId: string; status: AttendanceStatus }>) => void;

  // Advance methods
  addAdvance: (adv: Omit<AdvanceRecord, 'id' | 'createdAt'>) => AdvanceRecord;
  deleteAdvance: (id: string) => void;

  // Commission methods
  addCommission: (comm: Omit<CommissionRecord, 'id' | 'createdAt'>) => CommissionRecord;
  deleteCommission: (id: string) => void;

  // Payment methods
  addPayment: (payment: Omit<SalaryPaymentRecord, 'id' | 'createdAt'>) => SalaryPaymentRecord;
  deletePayment: (id: string) => void;

  // Adjustment methods
  saveAdjustment: (adj: Omit<SalaryAdjustmentRecord, 'id'>) => void;

  // Settings
  updateSettings: (settings: Partial<ShopSettings>) => void;

  // Data management
  resetToDemoData: () => void;
  clearAll: () => void;
  exportData: () => void;
  importData: (imported: PayrollAppState) => boolean;

  // Quick Action Modal states
  quickModal: string | null;
  setQuickModal: (modal: string | null) => void;
  selectedEmployeeForProfile: Employee | null;
  setSelectedEmployeeForProfile: (emp: Employee | null) => void;
  selectedSalarySlipSummary: any | null;
  setSelectedSalarySlipSummary: (summary: any | null) => void;
  selectedPaymentVoucher: SalaryPaymentRecord | null;
  setSelectedPaymentVoucher: (p: SalaryPaymentRecord | null) => void;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export const PayrollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PayrollAppState>(() => loadStoredData());
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentYYYYMM());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [quickModal, setQuickModal] = useState<string | null>(null);
  const [selectedEmployeeForProfile, setSelectedEmployeeForProfile] = useState<Employee | null>(null);
  const [selectedSalarySlipSummary, setSelectedSalarySlipSummary] = useState<any | null>(null);
  const [selectedPaymentVoucher, setSelectedPaymentVoucher] = useState<SalaryPaymentRecord | null>(null);

  // Save changes to localStorage automatically
  useEffect(() => {
    saveStoredData(state);
  }, [state]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = generateId('toast');
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Employees
  const addEmployee = (empData: Omit<Employee, 'id' | 'createdAt'>): Employee => {
    const newEmp: Employee = {
      ...empData,
      id: generateId('emp'),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      employees: [newEmp, ...prev.employees],
    }));
    showToast(`कर्मचारी "${newEmp.name}" सफलतापूर्वक जोड़ा गया! (Employee added)`);
    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((emp) =>
        emp.id === id ? { ...emp, ...updates } : emp
      ),
    }));
    showToast('कर्मचारी का विवरण अपडेट हो गया! (Employee updated)');
  };

  const deleteEmployee = (id: string) => {
    const emp = state.employees.find((e) => e.id === id);
    const empName = emp ? emp.name : 'Employee';
    setState((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
      attendance: prev.attendance.filter((a) => a.employeeId !== id),
      advances: prev.advances.filter((a) => a.employeeId !== id),
      commissions: prev.commissions.filter((c) => c.employeeId !== id),
      payments: prev.payments.filter((p) => p.employeeId !== id),
      adjustments: prev.adjustments.filter((adj) => adj.employeeId !== id),
    }));
    if (selectedEmployeeForProfile?.id === id) {
      setSelectedEmployeeForProfile(null);
    }
    showToast(`"${empName}" का रिकॉर्ड हटा दिया गया। (Record deleted)`, 'info');
  };

  // Attendance
  const markAttendance = (
    employeeId: string,
    date: string,
    status: AttendanceStatus,
    note?: string
  ) => {
    setState((prev) => {
      const filtered = prev.attendance.filter(
        (a) => !(a.employeeId === employeeId && a.date === date)
      );
      const newRecord: AttendanceRecord = {
        id: generateId('att'),
        employeeId,
        date,
        status,
        note,
      };
      return {
        ...prev,
        attendance: [...filtered, newRecord],
      };
    });
  };

  const batchMarkAttendance = (
    date: string,
    records: Array<{ employeeId: string; status: AttendanceStatus }>
  ) => {
    setState((prev) => {
      const empIds = new Set(records.map((r) => r.employeeId));
      const filtered = prev.attendance.filter(
        (a) => !(a.date === date && empIds.has(a.employeeId))
      );
      const newItems: AttendanceRecord[] = records.map((r) => ({
        id: generateId('att'),
        employeeId: r.employeeId,
        date,
        status: r.status,
      }));
      return {
        ...prev,
        attendance: [...filtered, ...newItems],
      };
    });
    showToast(`तारीख ${date} के लिए सभी की हाजिरी दर्ज की गई! (Attendance updated)`);
  };

  // Advances
  const addAdvance = (advData: Omit<AdvanceRecord, 'id' | 'createdAt'>): AdvanceRecord => {
    const newAdv: AdvanceRecord = {
      ...advData,
      id: generateId('adv'),
      recoveredAmount: 0,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      advances: [newAdv, ...prev.advances],
    }));
    showToast(`पेशगी / एडवांस ₹${newAdv.amount} दर्ज किया गया! (Advance added)`);
    return newAdv;
  };

  const deleteAdvance = (id: string) => {
    setState((prev) => ({
      ...prev,
      advances: prev.advances.filter((a) => a.id !== id),
    }));
    showToast('पेशगी रिकॉर्ड हटाया गया। (Advance deleted)', 'info');
  };

  // Commission
  const addCommission = (
    commData: Omit<CommissionRecord, 'id' | 'createdAt'>
  ): CommissionRecord => {
    const newComm: CommissionRecord = {
      ...commData,
      id: generateId('comm'),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      commissions: [newComm, ...prev.commissions],
    }));
    showToast(
      `बिक्री कमीशन ₹${newComm.commissionAmount} जोड़ा गया! (Commission added)`
    );
    return newComm;
  };

  const deleteCommission = (id: string) => {
    setState((prev) => ({
      ...prev,
      commissions: prev.commissions.filter((c) => c.id !== id),
    }));
    showToast('कमीशन रिकॉर्ड हटाया गया। (Commission deleted)', 'info');
  };

  // Payment
  const addPayment = (
    paymentData: Omit<SalaryPaymentRecord, 'id' | 'createdAt'>
  ): SalaryPaymentRecord => {
    const newPayment: SalaryPaymentRecord = {
      ...paymentData,
      id: generateId('pay'),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      payments: [newPayment, ...prev.payments],
    }));
    showToast(
      `वेतन भुगतान ₹${newPayment.amountPaid} दर्ज किया गया! (Payment saved)`
    );
    return newPayment;
  };

  const deletePayment = (id: string) => {
    setState((prev) => ({
      ...prev,
      payments: prev.payments.filter((p) => p.id !== id),
    }));
    showToast('भुगतान रिकॉर्ड हटाया गया। (Payment record deleted)', 'info');
  };

  // Salary Adjustment
  const saveAdjustment = (adjData: Omit<SalaryAdjustmentRecord, 'id'>) => {
    setState((prev) => {
      const filtered = prev.adjustments.filter(
        (a) =>
          !(a.employeeId === adjData.employeeId && a.month === adjData.month)
      );
      const newAdj: SalaryAdjustmentRecord = {
        ...adjData,
        id: generateId('adj'),
      };
      return {
        ...prev,
        adjustments: [...filtered, newAdj],
      };
    });
    showToast('वेतन एडजस्टमेंट व पेशगी कटौती सेव हो गई! (Adjustment saved)');
  };

  // Settings
  const updateSettings = (updates: Partial<ShopSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
    showToast('दुकान सेटिंग्स व नियम अपडेट हो गए! (Settings updated)');
  };

  // Data management
  const resetToDemoData = () => {
    const demo = getDemoData();
    setState(demo);
    showToast('डेमो डेटा सफलतापूर्वक लोड हो गया! (Demo data loaded)');
  };

  const clearAll = () => {
    const empty: PayrollAppState = {
      employees: [],
      attendance: [],
      advances: [],
      commissions: [],
      payments: [],
      adjustments: [],
      settings: state.settings,
    };
    setState(empty);
    clearStoredData();
    showToast('सारा डेटा हटा दिया गया है। (All data cleared)', 'info');
  };

  const exportData = () => {
    exportBackupJSON(state);
    showToast('बैकअप फ़ाइल डाउनलोड हो गई! (Backup downloaded)');
  };

  const importData = (imported: PayrollAppState): boolean => {
    if (!imported || !Array.isArray(imported.employees)) {
      showToast('अमान्य बैकअप फ़ाइल! (Invalid backup JSON)', 'error');
      return false;
    }
    setState({
      employees: imported.employees || [],
      attendance: imported.attendance || [],
      advances: imported.advances || [],
      commissions: imported.commissions || [],
      payments: imported.payments || [],
      adjustments: imported.adjustments || [],
      settings: { ...state.settings, ...(imported.settings || {}) },
    });
    showToast('बैकअप सफलतापूर्वक रीस्टोर हो गया! (Data restored successfully)');
    return true;
  };

  return (
    <PayrollContext.Provider
      value={{
        state,
        selectedMonth,
        setSelectedMonth,
        activeTab,
        setActiveTab,
        toasts,
        showToast,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        markAttendance,
        batchMarkAttendance,
        addAdvance,
        deleteAdvance,
        addCommission,
        deleteCommission,
        addPayment,
        deletePayment,
        saveAdjustment,
        updateSettings,
        resetToDemoData,
        clearAll,
        exportData,
        importData,
        quickModal,
        setQuickModal,
        selectedEmployeeForProfile,
        setSelectedEmployeeForProfile,
        selectedSalarySlipSummary,
        setSelectedSalarySlipSummary,
        selectedPaymentVoucher,
        setSelectedPaymentVoucher,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
};
