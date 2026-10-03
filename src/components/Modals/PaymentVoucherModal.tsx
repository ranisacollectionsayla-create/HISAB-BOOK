import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { SalaryPaymentRecord } from '../../types';
import { formatINR, formatDateDDMMYYYY, getMonthLabel } from '../../utils/formatters';
import { X, Printer, Store, CheckCircle } from 'lucide-react';

interface Props {
  payment: SalaryPaymentRecord;
  onClose: () => void;
}

export const PaymentVoucherModal: React.FC<Props> = ({ payment, onClose }) => {
  const { state } = usePayroll();
  const employee = state.employees.find((e) => e.id === payment.employeeId);

  const handlePrint = () => {
    window.print();
  };

  const modeLabels: Record<string, string> = {
    cash: 'नकद (Cash)',
    upi: 'UPI (GPay / PhonePe / Paytm)',
    bank: 'Bank Transfer (NEFT / IMPS)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        {/* Controls */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg">भुगतान रसीद (Payment Receipt)</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              प्रिंट रसीद (Print)
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="printable-area p-8 bg-white text-slate-800 space-y-5">
          {/* Header */}
          <div className="text-center border-b pb-3 border-slate-300">
            <h2 className="text-xl font-black text-slate-900 uppercase">
              {state.settings.shopName || 'RANISA COLLECTION'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {state.settings.address} • {state.settings.phone}
            </p>
            <div className="mt-2 inline-block px-3 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
              वेतन भुगतान रसीद (Salary Payment Voucher)
            </div>
          </div>

          {/* Details */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 text-xs bg-slate-50">
            <div className="flex justify-between">
              <span className="text-slate-500">भुगतान तारीख (Date):</span>
              <span className="font-bold text-slate-800">{formatDateDDMMYYYY(payment.paymentDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">कर्मचारी का नाम (Employee):</span>
              <span className="font-bold text-slate-900 text-sm">{employee?.name || 'Unknown'}</span>
            </div>
            {employee?.fatherName && (
              <div className="flex justify-between">
                <span className="text-slate-500">पिता का नाम:</span>
                <span className="font-semibold text-slate-700">{employee.fatherName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">वेतन माह (Salary Month):</span>
              <span className="font-semibold text-slate-800">{getMonthLabel(payment.salaryMonth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">भुगतान माध्यम (Payment Mode):</span>
              <span className="font-semibold text-slate-800">{modeLabels[payment.paymentMode] || payment.paymentMode}</span>
            </div>
            {payment.note && (
              <div className="flex justify-between">
                <span className="text-slate-500">विवरण (Note):</span>
                <span className="text-slate-700 italic">{payment.note}</span>
              </div>
            )}
          </div>

          {/* Amount Paid Callout */}
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                कुल भुगतान राशि (Amount Paid):
              </span>
              <div className="text-2xl font-black text-emerald-900 mt-0.5">
                {formatINR(payment.amountPaid)}
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>

          {/* Signature */}
          <div className="pt-10 grid grid-cols-2 gap-6 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">
                प्राप्तकर्ता के हस्ताक्षर (Receiver)
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-2 font-medium text-slate-700">
                भुगतानकर्ता हस्ताक्षर (Authorized Signatory)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
