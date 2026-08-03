import React, { useState } from 'react';
import { Supplier } from '../types';
import { Truck, Plus, Phone, Mail, MapPin, Search } from 'lucide-react';

interface SuppliersManagerProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Supplier) => void;
}

export const SuppliersManager: React.FC<SuppliersManagerProps> = ({ suppliers, onAddSupplier }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('0114002938');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('الرياض - المنطقة الصناعية الثانية');

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name,
      companyName: name,
      contactPerson,
      phone,
      email: email || `${name.replace(/\s+/g, '').toLowerCase()}@pharma-supplier.com`,
      address,
      rating: 5.0,
    };

    onAddSupplier(newSup);
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="w-7 h-7 text-teal-600" />
            إدارة الموردين والشركات المصنعة (Suppliers Directory)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            سجل الموردين المعتمدين، شركات التوزيع الدوائي، وأرقام التواصل وطلبات التوريد.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة شركة موردة جديدة
        </button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((sup) => (
          <div key={sup.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{sup.name}</h4>
                <p className="text-xs text-teal-600 font-bold">مسؤول المبيعات: {sup.contactPerson}</p>
              </div>
              <span className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded-xl">
                <Truck className="w-5 h-5" />
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {sup.phone}</p>
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {sup.email}</p>
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {sup.address}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">إضافة شركة موردة جديدة</h3>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">اسم الشركة الموردة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">اسم الشخص المسؤول *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">رقم هاتف التواصل *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  حفظ المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
