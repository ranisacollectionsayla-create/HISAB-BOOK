import React from 'react';
import { usePayroll } from '../context/PayrollContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = usePayroll();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold transition-all max-w-sm ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : toast.type === 'info'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-emerald-900 text-white border-emerald-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-300 flex-shrink-0" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-slate-300 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
