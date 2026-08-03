import React, { useState } from 'react';
import { Patient } from '../types';
import { Users, Plus, Search, Phone, Mail, AlertTriangle, Activity, Calendar, FileText } from 'lucide-react';

interface PatientsManagerProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
}

export const PatientsManager: React.FC<PatientsManagerProps> = ({ patients, onAddPatient }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('0501234567');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [allergies, setAllergies] = useState('بنسلين');
  const [chronicDiseases, setChronicDiseases] = useState('ضغط الدم');

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newP: Patient = {
      id: `pat-${Date.now()}`,
      name,
      phone,
      email: `${name.replace(/\s+/g, '').toLowerCase()}@example.com`,
      age,
      gender,
      allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
      chronicDiseases: chronicDiseases.split(',').map((s) => s.trim()).filter(Boolean),
      medicalHistoryNotes: 'تم إنشاء السجل الطبي الأولي بنجاح',
      insuranceNumber: `INS-${Math.floor(100000 + Math.random() * 900000)}`,
      insuranceProvider: 'شركة التعاونية للتأمين الطبي',
    };

    onAddPatient(newP);
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-7 h-7 text-teal-600" />
            إدارة المرضى والسجلات الطبية (Patients Record System)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل المرضى، متابعة التفاعلات والحساسية، التأمين الطبي، والتاريخ المرضي.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة مريض جديد
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="البحث باسم المريض، رقم الجوال، أو رقم الملف الطبي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs border-none outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((pat) => (
          <div key={pat.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-slate-100">{pat.name}</h4>
                  <p className="text-xs text-slate-400">{pat.age} سنة | {pat.gender}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  {pat.insuranceProvider || 'نقدي'}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {pat.phone}
                </p>
                {pat.insuranceNumber && (
                  <p className="text-[11px] text-slate-400 font-mono">رقم التأمين: {pat.insuranceNumber}</p>
                )}
              </div>

              {/* Allergy Warning if exists */}
              {pat.allergies.length > 0 && (
                <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    تحسس من: {pat.allergies.join('، ')}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">الأمراض المزمنة: {pat.chronicDiseases.join('، ') || 'لا يوجد'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">إضافة سجل مريض جديد</h3>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">اسم المريض الكامل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">رقم الجوال *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">العمر (سنوات)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">الحساسية والمواد الضارة (مفصولة بـ فاصلة)</label>
                <input
                  type="text"
                  placeholder="مثال: بنسلين، أسبرين"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">الأمراض المزمنة (مفصولة بـ فاصلة)</label>
                <input
                  type="text"
                  placeholder="مثال: ضغط، سكري"
                  value={chronicDiseases}
                  onChange={(e) => setChronicDiseases(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold"
                >
                  حفظ السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
