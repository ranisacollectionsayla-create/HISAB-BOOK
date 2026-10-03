import React, { useState } from 'react';
import { usePayroll } from '../context/PayrollContext';
import { Employee } from '../types';
import { formatINR, formatDateDDMMYYYY } from '../utils/formatters';
import { exportEmployeesToExcel } from '../utils/excelExport';
import {
  Users,
  Search,
  PlusCircle,
  FileSpreadsheet,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Edit,
  Trash2,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { AddEmployeeModal } from './Modals/AddEmployeeModal';

export const Employees: React.FC = () => {
  const { state, deleteEmployee, setSelectedEmployeeForProfile } = usePayroll();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'monthly' | 'daily'>('all');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Search by name, mobile, fatherName, or village
  const filteredEmployees = state.employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.mobileNumber.includes(searchTerm) ||
      (emp.fatherName && emp.fatherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.village && emp.village.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    return emp.salaryType === filterType;
  });

  const handleDelete = (emp: Employee) => {
    if (
      window.confirm(
        `क्या आप सचमुच "${emp.name}" का रिकॉर्ड हटाना चाहते हैं? इसके सभी वेतन व हाजिरी रिकॉर्ड भी हट जाएंगे।`
      )
    ) {
      deleteEmployee(emp.id);
    }
  };

  const handleExport = () => {
    exportEmployeesToExcel(filteredEmployees);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">
              कर्मचारी प्रबंधन (Employee Management)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            दुकान के सभी कर्मचारियों की सूची, वेतन दर व विवरण ({state.employees.length} कुल कर्मचारी)
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExport}
            disabled={filteredEmployees.length === 0}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
            एक्सेल एक्सपोर्ट (Excel)
          </button>
          <button
            onClick={() => {
              setEditingEmployee(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-md transition"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            + नया कर्मचारी (Add Employee)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="नाम, मोबाइल, गाँव या पिता के नाम से खोजें..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            सभी ({state.employees.length})
          </button>
          <button
            onClick={() => setFilterType('monthly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              filterType === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            मासिक ({state.employees.filter((e) => e.salaryType === 'monthly').length})
          </button>
          <button
            onClick={() => setFilterType('daily')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              filterType === 'daily'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            दैनिक ({state.employees.filter((e) => e.salaryType === 'daily').length})
          </button>
        </div>
      </div>

      {/* Employee Cards Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-700">कोई कर्मचारी नहीं मिला</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            खोज शब्द बदलें या "+ नया कर्मचारी" बटन दबाकर नया कर्मचारी जोड़ें।
          </p>
          <button
            onClick={() => {
              setEditingEmployee(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs"
          >
            + नया कर्मचारी जोड़ें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header of card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-lg font-black shadow-xs">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3
                        onClick={() => setSelectedEmployeeForProfile(emp)}
                        className="font-bold text-base text-slate-900 hover:text-rose-600 cursor-pointer transition"
                      >
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {emp.fatherName ? `पिता: ${emp.fatherName}` : 'पिता का नाम दर्ज नहीं'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      emp.salaryType === 'monthly'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {emp.salaryType === 'monthly' ? 'मासिक' : 'दैनिक'}
                  </span>
                </div>

                {/* Details list */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      वेतन दर (Salary Rate):
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatINR(emp.salaryAmount)}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                        {emp.salaryType === 'monthly' ? '/माह' : '/दिन'}
                      </span>
                    </span>
                  </div>

                  {emp.mobileNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        मोबाइल:
                      </span>
                      <span className="font-semibold text-slate-800">{emp.mobileNumber}</span>
                    </div>
                  )}

                  {emp.village && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        गाँव / शहर:
                      </span>
                      <span className="font-semibold text-slate-800">{emp.village}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      जुड़ने की तारीख:
                    </span>
                    <span className="font-medium text-slate-700">
                      {formatDateDDMMYYYY(emp.joiningDate)}
                    </span>
                  </div>

                  {emp.commissionEnabled && (
                    <div className="flex items-center justify-between bg-indigo-50/60 p-2 rounded-lg text-indigo-900">
                      <span className="font-medium">बिक्री कमीशन लागू:</span>
                      <span className="font-bold">{emp.commissionPercentage}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedEmployeeForProfile(emp)}
                  className="inline-flex items-center text-xs font-bold text-rose-600 hover:text-rose-700"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  प्रोफाइल व इतिहास
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setEditingEmployee(emp);
                      setShowAddModal(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Employee"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(emp)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {showAddModal && (
        <AddEmployeeModal
          employeeToEdit={editingEmployee}
          onClose={() => {
            setShowAddModal(false);
            setEditingEmployee(null);
          }}
        />
      )}
    </div>
  );
};
