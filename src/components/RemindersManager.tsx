import React, { useState } from 'react';
import { DoseReminder, Patient } from '../types';
import { Clock, Plus, Bell, CheckCircle2, User, Pill, AlertCircle } from 'lucide-react';

interface RemindersManagerProps {
  reminders: DoseReminder[];
  patients: Patient[];
  onAddReminder: (reminder: DoseReminder) => void;
  onToggleTaken: (id: string) => void;
}

export const RemindersManager: React.FC<RemindersManagerProps> = ({
  reminders,
  patients,
  onAddReminder,
  onToggleTaken,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [medicineName, setMedicineName] = useState('أوجمنتين 1 جرام');
  const [dosage, setDosage] = useState('قرص واحد (1000mg)');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState('مرتين يومياً (كل 12 ساعة)');

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const p = patients.find((pat) => pat.id === selectedPatientId);
    const newRem: DoseReminder = {
      id: `rem-${Date.now()}`,
      patientId: selectedPatientId,
      patientName: p?.name || 'مريض غير محدد',
      medicineName,
      dosage,
      time,
      frequency,
      taken: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-08-10',
    };

    onAddReminder(newRem);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-7 h-7 text-teal-600" />
            جدول التذكير بالجرعات والمنبهات (Dose Reminders)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            جدولة مواعيد تناوُل الدواء للمرضى مع تنبيهات ومتابعة التأكيد بالأخذ.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          جدولة تنبيه جرعة جديد
        </button>
      </div>

      {/* Reminders List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`rounded-3xl p-5 border shadow-sm space-y-3 transition-all ${
              rem.taken
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  المريض: {rem.patientName}
                </span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mt-0.5">{rem.medicineName}</h4>
              </div>
              <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                {rem.time}
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p><strong>الجرعة:</strong> {rem.dosage}</p>
              <p><strong>التكرار:</strong> {rem.frequency}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className={`text-[11px] font-bold ${rem.taken ? 'text-emerald-600' : 'text-amber-600'}`}>
                {rem.taken ? 'تم تناوُل الجرعة بنجاح' : 'في انتظار التناوُل'}
              </span>

              <button
                onClick={() => onToggleTaken(rem.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  rem.taken
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {rem.taken ? 'تأكيد الأخذ' : 'تعليم كمأخوذ'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">جدولة تنبيه جرعة دواء للمريض</h3>

            <form onSubmit={handleCreateReminder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">اختيار المريض *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">اسم الدواء *</label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">مقدار الجرعة</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">وقت التنبيه</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                  />
                </div>
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
                  حفظ التنبيه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
