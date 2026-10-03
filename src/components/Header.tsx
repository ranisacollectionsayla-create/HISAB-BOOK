import React from 'react';
import { usePayroll } from '../context/PayrollContext';
import { formatDateDDMMYYYY, getTodayYYYYMMDD } from '../utils/formatters';
import {
  Calendar,
  Store,
  PlusCircle,
  Clock,
  Menu,
  X,
  CreditCard,
  HandCoins,
  TrendingUp,
} from 'lucide-react';

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { state, setQuickModal } = usePayroll();
  const today = getTodayYYYYMMDD();
  const formattedToday = formatDateDDMMYYYY(today);

  const hindiDays = ['रविवार (Sun)', 'सोमवार (Mon)', 'मंगलवार (Tue)', 'बुधवार (Wed)', 'गुरुवार (Thu)', 'शुक्रवार (Fri)', 'शनिवार (Sat)'];
  const dayIndex = new Date().getDay();
  const currentDayName = hindiDays[dayIndex];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Title */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md font-bold text-xl tracking-wider">
                RP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    RANISA PAYROLL PRO
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                    <Store className="w-3 h-3 mr-1" />
                    {state.settings.shopName || 'Ranisa Collection'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Simple Employee Salary & Attendance Management • राणीसा पेरोल प्रो
                </p>
              </div>
            </div>
          </div>

          {/* Right: Date, Quick Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Indian Date */}
            <div className="hidden md:flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-medium">
              <Calendar className="w-4 h-4 mr-2 text-rose-600" />
              <span>{formattedToday}</span>
              <span className="mx-1.5 text-slate-400">|</span>
              <span className="text-slate-600 font-normal">{currentDayName}</span>
            </div>

            {/* Quick action buttons */}
            <button
              onClick={() => setQuickModal('mark_attendance')}
              className="inline-flex items-center px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              title="आज की हाजिरी (Mark Today's Attendance)"
            >
              <Clock className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">हाजिरी (Attendance)</span>
            </button>

            <button
              onClick={() => setQuickModal('salary_payment')}
              className="inline-flex items-center px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
              title="वेतन भुगतान (Salary Payment)"
            >
              <CreditCard className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">वेतन भुगतान (Pay)</span>
            </button>

            <button
              onClick={() => setQuickModal('add_employee')}
              className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">+ कर्मचारी (Add)</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
