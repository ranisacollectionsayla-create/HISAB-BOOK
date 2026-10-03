import React, { useState, useRef } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { ShopSettings } from '../types';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Store,
  Sliders,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    state,
    updateSettings,
    exportData,
    importData,
    clearAll,
    resetToDemoData,
    showToast,
  } = usePayroll();

  // Local form state for settings
  const [formData, setFormData] = useState<ShopSettings>({ ...state.settings });
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [clearConfirmText, setClearConfirmText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const ok = importData(parsed);
        if (ok && fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        showToast('फ़ाइल को पढ़ने में त्रुटि (Error parsing JSON backup file)', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmClear = () => {
    if (clearConfirmText.trim().toUpperCase() === 'DELETE') {
      clearAll();
      setShowClearModal(false);
      setClearConfirmText('');
    } else {
      showToast('कृपया पुष्टि के लिए "DELETE" टाइप करें', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">
              दुकान सेटिंग्स व बैकअप (Settings & Backup)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            दुकान का विवरण, वेतन गणना के नियम, डेटा बैकअप और रीस्टोर प्रबंधन
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Shop Info & Configurable Salary Calculation Rules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shop Profile Form */}
          <form
            onSubmit={handleSaveSettings}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
              <Store className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900">
                दुकान की जानकारी (Shop Details)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  दुकान का नाम (Shop Name)
                </label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) =>
                    setFormData({ ...formData, shopName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  उप-शीर्षक (Shop Subtitle)
                </label>
                <input
                  type="text"
                  value={formData.shopSubtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, shopSubtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  मालिक का नाम (Owner / Manager)
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  मोबाइल / संपर्क (Phone)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  दुकान का पता (Address - पर्ची व रिपोर्ट पर छपेगा)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Configurable Salary Rules Section (Requirement #16) */}
            <div className="pt-4 mt-4 border-t border-slate-200">
              <div className="flex items-center space-x-2 mb-3">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    वेतन गणना के नियम (Salary Calculation Rules)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    मासिक वेतन का दैनिक दर, छुट्टी व हाजिरी कटौती के नियम
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Rule 1: Month Divisor */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    1. मासिक वेतन के लिए महीने के दिन (Month Divisor):
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    मासिक वेतन में 1 दिन की मजदूरी निकालने का आधार:
                  </p>
                  <select
                    value={formData.monthDivisorType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthDivisorType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
                  >
                    <option value="actual_days">
                      वास्तविक महीने के दिन (Actual days in month e.g. 30 या 31 दिन) - सर्वोत्तम
                    </option>
                    <option value="fixed_30">
                      हमेशा 30 दिन मानकर (Fixed 30 days divisor)
                    </option>
                    <option value="fixed_26">
                      26 कार्य दिवस मानकर - 4 रविवार को छोड़कर (Fixed 26 working days)
                    </option>
                  </select>
                </div>

                {/* Rule 2: Leave Deduction Policy */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. छुट्टी कटौती नियम (Leave Deduction Policy):
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1.5">
                    जब कर्मचारी छुट्टी (L) लेता है:
                  </p>
                  <select
                    value={formData.leaveDeductionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leaveDeductionType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
                  >
                    <option value="unpaid">
                      सभी छुट्टियां अवैतनिक (Unpaid - वेतन कटेगा)
                    </option>
                    <option value="one_paid_leave_per_month">
                      महीने की 1 छुट्टी सवेतन (1 Paid Leave per month allowed)
                    </option>
                    <option value="paid_all">
                      सभी छुट्टियां सवेतन (Paid Leaves - कोई कटौती नहीं)
                    </option>
                  </select>
                </div>

                {/* Rule 3: Half-day calculation */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    3. आधा दिन गणना (Half-Day Multiplier):
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">
                      आधा दिन को माना जाएगा:
                    </span>
                    <span className="font-extrabold text-xs text-indigo-700 bg-white px-2 py-1 border rounded-md">
                      0.5 दिन (आधा दिन वेतन)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition"
              >
                सेटिंग्स व नियम सेव करें (Save Settings)
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Backup, Restore & Data Danger Zone */}
        <div className="space-y-6">
          {/* Backup & Restore Card (Requirement #11) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              बैकअप और रीस्टोर (Backup & Restore)
            </h3>
            <p className="text-xs text-slate-500">
              अपने कंप्यूटर या मोबाइल पर पूरा पेरोल डेटा सुरक्षित डाउनलोड करें ताकि डेटा कभी खो न सके।
            </p>

            <div className="space-y-2.5">
              {/* Export Backup Button */}
              <button
                type="button"
                onClick={exportData}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
              >
                <Download className="w-4 h-4 mr-2" />
                बैकअप फ़ाइल डाउनलोड करें (Export JSON)
              </button>

              {/* Import Backup Button */}
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="import-backup-input"
                />
                <label
                  htmlFor="import-backup-input"
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-300 cursor-pointer transition"
                >
                  <Upload className="w-4 h-4 mr-2 text-slate-600" />
                  बैकअप रीस्टोर करें (Import JSON)
                </label>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
              ✓ आपका डेटा ब्राउज़र के लोकल स्टोरेज में ऑटो-सेव रहता है और पेज रीफ्रेश करने पर भी बना रहता है।
            </div>
          </div>

          {/* Demo Data Management (Requirement #15) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-600" />
              डेमो डेटा (Demo Sample Data)
            </h3>
            <p className="text-xs text-slate-500">
              सॉफ्टवेयर को टेस्ट करने के लिए कपड़े की दुकान का नमूना डेटा लोड करें।
            </p>
            <button
              type="button"
              onClick={resetToDemoData}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-xl text-xs transition"
            >
              + नमूना डेटा लोड करें (Load Demo Data)
            </button>
          </div>

          {/* Danger Zone (Clear All Data) */}
          <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              डेटा रीसेट (Danger Zone)
            </h3>
            <p className="text-xs text-slate-500">
              सावधानी: यह सभी कर्मचारियों, हाजिरी, वेतन और भुगतान का रिकॉर्ड मिटा देगा।
            </p>
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="w-full py-2 px-3 bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 font-bold rounded-xl text-xs transition"
            >
              सभी डेटा हटाएं (Clear All Data)
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clear All Data */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-300 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="font-extrabold text-base text-slate-900">
                क्या आप सचमुच सारा डेटा मिटाना चाहते हैं?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              यह क्रिया अपरिवर्तनीय है। आपके सभी कर्मचारी, हाजिरी रिकॉर्ड, वेतन इतिहास व पेशगी विवरण स्थायी रूप से मिट जाएंगे।
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पुष्टि के लिए नीचे <strong>DELETE</strong> लिखें:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-rose-300 rounded-xl text-center font-bold tracking-widest text-sm focus:ring-2 focus:ring-rose-500 uppercase"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowClearModal(false);
                  setClearConfirmText('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={clearConfirmText.trim().toUpperCase() !== 'DELETE'}
                onClick={handleConfirmClear}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
              >
                हाँ, पूरा डेटा मिटाएं
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
