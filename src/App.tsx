import React, { useState } from 'react';
import { PayrollProvider, usePayroll } from './context/PayrollContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Employees } from './components/Employees';
import { Attendance } from './components/Attendance';
import { Salary } from './components/Salary';
import { Advance } from './components/Advance';
import { Commission } from './components/Commission';
import { Payments } from './components/Payments';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { ToastContainer } from './components/ToastContainer';
import { AddEmployeeModal } from './components/Modals/AddEmployeeModal';
import { MarkAttendanceModal } from './components/Modals/MarkAttendanceModal';
import { SalaryPaymentModal } from './components/Modals/SalaryPaymentModal';
import { AddAdvanceModal } from './components/Modals/AddAdvanceModal';
import { AddCommissionModal } from './components/Modals/AddCommissionModal';
import { EmployeeProfileModal } from './components/Modals/EmployeeProfileModal';
import { SalarySlipModal } from './components/Modals/SalarySlipModal';
import { PaymentVoucherModal } from './components/Modals/PaymentVoucherModal';
import { Employee } from './types';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    quickModal,
    setQuickModal,
    selectedEmployeeForProfile,
    setSelectedEmployeeForProfile,
    selectedSalarySlipSummary,
    setSelectedSalarySlipSummary,
    selectedPaymentVoucher,
    setSelectedPaymentVoucher,
  } = usePayroll();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  // Render view corresponding to activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <Employees />;
      case 'attendance':
        return <Attendance />;
      case 'salary':
        return <Salary />;
      case 'advance':
        return <Advance />;
      case 'commission':
        return <Commission />;
      case 'payments':
        return <Payments />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Header */}
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals */}
      {/* Quick modal: Add Employee */}
      {(quickModal === 'add_employee' || employeeToEdit) && (
        <AddEmployeeModal
          employeeToEdit={employeeToEdit}
          onClose={() => {
            setQuickModal(null);
            setEmployeeToEdit(null);
          }}
        />
      )}

      {/* Quick modal: Mark Attendance */}
      {quickModal === 'mark_attendance' && (
        <MarkAttendanceModal onClose={() => setQuickModal(null)} />
      )}

      {/* Quick modal: Salary Payment */}
      {quickModal === 'salary_payment' && (
        <SalaryPaymentModal onClose={() => setQuickModal(null)} />
      )}

      {/* Quick modal: Add Advance */}
      {quickModal === 'add_advance' && (
        <AddAdvanceModal onClose={() => setQuickModal(null)} />
      )}

      {/* Quick modal: Add Commission */}
      {quickModal === 'add_commission' && (
        <AddCommissionModal onClose={() => setQuickModal(null)} />
      )}

      {/* Employee Profile Modal */}
      {selectedEmployeeForProfile && (
        <EmployeeProfileModal
          employee={selectedEmployeeForProfile}
          onClose={() => setSelectedEmployeeForProfile(null)}
          onEdit={(emp) => {
            setSelectedEmployeeForProfile(null);
            setEmployeeToEdit(emp);
          }}
        />
      )}

      {/* Salary Slip Print Modal */}
      {selectedSalarySlipSummary && (
        <SalarySlipModal
          summary={selectedSalarySlipSummary}
          onClose={() => setSelectedSalarySlipSummary(null)}
        />
      )}

      {/* Payment Receipt Voucher Modal */}
      {selectedPaymentVoucher && (
        <PaymentVoucherModal
          payment={selectedPaymentVoucher}
          onClose={() => setSelectedPaymentVoucher(null)}
        />
      )}

      {/* Toast feedback alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <PayrollProvider>
      <MainLayout />
    </PayrollProvider>
  );
}
