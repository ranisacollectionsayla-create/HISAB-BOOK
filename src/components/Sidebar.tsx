import React from 'react';
import { usePayroll } from '../context/PayrollContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Calculator,
  HandCoins,
  TrendingUp,
  Receipt,
  FileBarChart2,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { activeTab, setActiveTab, state, resetToDemoData } = usePayroll();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      hindi: 'डैशबोर्ड',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'employees',
      label: 'Employees',
      hindi: 'कर्मचारी',
      icon: Users,
      badge: state.employees.length,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      hindi: 'हाजिरी',
      icon: CalendarCheck,
      badge: null,
    },
    {
      id: 'salary',
      label: 'Salary Sheet',
      hindi: 'वेतन पत्रक',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'advance',
      label: 'Advance',
      hindi: 'पेशगी / उधार',
      icon: HandCoins,
      badge: state.advances.length > 0 ? state.advances.length : null,
    },
    {
      id: 'commission',
      label: 'Commission',
      hindi: 'बिक्री कमीशन',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'payments',
      label: 'Payments',
      hindi: 'भुगतान रिकॉर्ड',
      icon: Receipt,
      badge: state.payments.length > 0 ? state.payments.length : null,
    },
    {
      id: 'reports',
      label: 'Reports',
      hindi: 'रिपोर्ट्स',
      icon: FileBarChart2,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Backup & Settings',
      hindi: 'सेटिंग्स व बैकअप',
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <div className="text-left">
                    <div className="leading-tight">{item.label}</div>
                    <div className={`text-[11px] ${isActive ? 'text-rose-500 font-normal' : 'text-slate-400'}`}>
                      {item.hindi}
                    </div>
                  </div>
                </div>

                {item.badge !== null && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive
                        ? 'bg-rose-200 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer / Quick Demo Data helper */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <div className="rounded-xl p-3 bg-white border border-slate-200 text-xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Local Offline Storage
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              सभी डेटा आपके ब्राउज़र में सुरक्षित सेव है।
            </p>
            {state.employees.length === 0 && (
              <button
                onClick={resetToDemoData}
                className="mt-2 w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-medium rounded-lg text-xs transition"
              >
                + लोड डेमो डेटा (Load Demo)
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
