import React, { useState } from 'react';
import { Prescription, Patient, Medicine, PrescriptionItem } from '../types';
import { FileText, Plus, Search, ShoppingCart, User, Stethoscope, Printer, CheckCircle, Calendar } from 'lucide-react';

interface PrescriptionsManagerProps {
  prescriptions: Prescription[];
  patients: Patient[];
  medicines: Medicine[];
  onAddPrescription: (prescription: Prescription) => void;
  onDispenseInPOS: (items: PrescriptionItem[]) => void;
}

export const PrescriptionsManager: React.FC<PrescriptionsManagerProps> = ({
  prescriptions,
  patients,
  medicines,
  onAddPrescription,
  onDispenseInPOS,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [doctorName, setDoctorName] = useState('د. محمد العتيبي');
  const [doctorSpecialty, setDoctorSpecialty] = useState('استشاري الأمراض الباطنية');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('التهاب الحلق الحاد مع ارتفاع حرارة بسيط');
  const [notes, setNotes] = useState('تناول العلاج بانتظام والراحة التامة لمدة 3 أيام.');
  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      medicineName: 'أوجمنتين 1 جرام (Augmentin 1g)',
      dosage: '1000mg',
      frequency: 'مرتين يومياً',
      duration: '7 أيام',
      instructions: 'بعد الطعام',
      quantity: 1,
    },
    {
      medicineName: 'بانادول اكسترا (Panadol Extra)',
      dosage: '500mg',
      frequency: 'عند الحاجة كل 8 ساعات',
      duration: '5 أيام',
      instructions: 'عند ارتفاع الحرارة',
      quantity: 1,
    },
  ]);

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId);
    const newP: Prescription = {
      id: `presc-${Date.now()}`,
      doctorName,
      doctorSpecialty,
      patientId: selectedPatientId,
      patientName: pat?.name || 'مريض غير محدد',
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      items: [...items],
      notes,
      status: 'active',
    };
    onAddPrescription(newP);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-7 h-7 text-teal-600" />
            إدارة الوصفات الطبية الرقمية (Digital Prescriptions)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إنشاء الوصفات الطبية، ربطها بالمرضى، وصرف الأدوية مباشرة في كاشير POS.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          إنشاء وصفة طبية جديدة
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="البحث باسم الطبيب، اسم المريض، أو التشخيص الطبي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs border-none outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Prescriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrescriptions.map((presc) => (
          <div key={presc.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{presc.doctorName}</h4>
                <p className="text-xs text-teal-600 font-medium">{presc.doctorSpecialty}</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {presc.status === 'active' ? 'نشطة وصالحة للصرف' : 'تم الصرف بالكامل'}
              </span>
            </div>

            <div className="text-xs space-y-1">
              <p><strong>المريض:</strong> {presc.patientName}</p>
              <p><strong>تاريخ الوصفة:</strong> {presc.date}</p>
              <p><strong>التشخيص الطبي:</strong> {presc.diagnosis}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400">الأدوية الموصوفة:</p>
              {presc.items.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.medicineName}</span>
                    <p className="text-[10px] text-slate-400">{item.dosage} | {item.frequency} | {item.instructions}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onDispenseInPOS(presc.items)}
              className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-teal-500 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              صرف هذه الوصفة في كاشير POS
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
