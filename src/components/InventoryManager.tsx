import React, { useState } from 'react';
import { Medicine, Supplier } from '../types';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Barcode, 
  QrCode, 
  Clock, 
  DollarSign,
  Layers,
  Check,
  X,
  Filter
} from 'lucide-react';

interface InventoryManagerProps {
  medicines: Medicine[];
  suppliers: Supplier[];
  onAddMedicine: (medicine: Medicine) => void;
  onUpdateMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  medicines,
  suppliers,
  onAddMedicine,
  onUpdateMedicine,
  onDeleteMedicine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'expiring'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '',
    scientificName: '',
    category: 'مسكنات ومخفضات حرارة',
    barcode: '',
    qrCode: '',
    price: 20,
    costPrice: 12,
    quantity: 50,
    minQuantity: 15,
    unit: 'علبة',
    batchNumber: `BT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    productionDate: '2025-01-01',
    expiryDate: '2027-01-01',
    manufacturer: 'شركة الدواء العربية',
    activeIngredients: ['Paracetamol'],
    dosageForm: 'أقراص',
    usageInstructions: 'تناول الدواء وفق تعليمات الطبيب.',
    requiresPrescription: false,
  });

  const categories = Array.from(new Set(medicines.map((m) => m.category)));

  // Filtered medicines list
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.barcode.includes(searchQuery) ||
      m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = m.quantity <= m.minQuantity;
    } else if (stockFilter === 'expiring') {
      const exp = new Date(m.expiryDate).getTime();
      const now = new Date().getTime();
      matchesStock = exp - now <= 90 * 24 * 60 * 60 * 1000;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode || !formData.price) {
      alert('الرجاء تعبئة اسم الدواء والباركوم والسعر بشكل صحيح.');
      return;
    }

    if (editingMed) {
      onUpdateMedicine({ ...editingMed, ...formData } as Medicine);
      setEditingMed(null);
    } else {
      const newMed: Medicine = {
        id: `med-${Date.now()}`,
        name: formData.name || '',
        scientificName: formData.scientificName || '',
        category: formData.category || 'عام',
        barcode: formData.barcode || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
        qrCode: formData.qrCode || `QR-${Date.now()}`,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        quantity: Number(formData.quantity),
        minQuantity: Number(formData.minQuantity),
        unit: formData.unit || 'علبة',
        batchNumber: formData.batchNumber || 'BT-2026-001',
        productionDate: formData.productionDate || '2025-01-01',
        expiryDate: formData.expiryDate || '2027-01-01',
        supplierId: suppliers[0]?.id || 'sup-1',
        manufacturer: formData.manufacturer || 'شركة عالمية',
        activeIngredients: typeof formData.activeIngredients === 'string' ? (formData.activeIngredients as string).split(',') : (formData.activeIngredients || []),
        dosageForm: formData.dosageForm || 'أقراص',
        sideEffects: ['اضطراب بسيط في المعدة عند تناول الجرعة الزائدة'],
        usageInstructions: formData.usageInstructions || 'اتباع تعليمات الوصفة.',
        contraindications: ['الحساسية المفرطة للمكونات'],
        localAlternatives: ['بديل محلي 1', 'بديل محلي 2'],
        importedAlternatives: ['بديل مستورد أجنبي'],
        cheaperAlternatives: ['بديل بنفس المادة بسعر أنسب'],
        requiresPrescription: Boolean(formData.requiresPrescription),
      };
      onAddMedicine(newMed);
      setShowAddModal(false);
    }
  };

  const openEditModal = (med: Medicine) => {
    setEditingMed(med);
    setFormData(med);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-7 h-7 text-teal-600" />
            إدارة المخزون والأدوية (Inventory System)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إدارة الأدوية، تتبع كميات التشغيلة (Batch Number)، تنبيهات الانتهاء وسعر الشراء والبيع.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMed(null);
            setFormData({
              name: '',
              scientificName: '',
              category: 'مسكنات ومخفضات حرارة',
              barcode: `${Math.floor(6291100000000 + Math.random() * 999999999)}`,
              qrCode: `QR-${Math.floor(1000 + Math.random() * 9000)}`,
              price: 25,
              costPrice: 15,
              quantity: 50,
              minQuantity: 15,
              unit: 'علبة (24 قرص)',
              batchNumber: `BT-2026-${Math.floor(100 + Math.random() * 900)}`,
              productionDate: '2025-01-01',
              expiryDate: '2027-06-01',
              manufacturer: 'شركة الدواء الوطنية',
              activeIngredients: ['Paracetamol'],
              dosageForm: 'أقراص',
              usageInstructions: 'تناول الدواء بعد الوجبة مع الماء.',
              requiresPrescription: false,
            });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة دواء جديد للمخزون
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3">
        
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="البحث باسم الدواء، المادة الفعالة، الباركوم، التشغيلة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs border-none outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 rounded-xl text-xs outline-none border-none"
          >
            <option value="all">جميع الفئات الصيدلانية</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Alert Filter */}
        <div className="sm:col-span-3 flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setStockFilter('all')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
              stockFilter === 'all' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            الكل ({medicines.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
              stockFilter === 'low' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            نقص ({medicines.filter(m => m.quantity <= m.minQuantity).length})
          </button>
        </div>

      </div>

      {/* Medicines Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <th className="py-3.5 px-4">اسم الدواء / العلمي</th>
                <th className="py-3.5 px-3">الفئة</th>
                <th className="py-3.5 px-3">الباركوم / QR</th>
                <th className="py-3.5 px-3">الرصيد المتاح</th>
                <th className="py-3.5 px-3">سعر الشراء / البيع</th>
                <th className="py-3.5 px-3">رقم التشغيلة</th>
                <th className="py-3.5 px-3">تاريخ الانتهاء</th>
                <th className="py-3.5 px-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredMedicines.map((med) => {
                const isLow = med.quantity <= med.minQuantity;
                const isExpiring = new Date(med.expiryDate).getTime() - new Date().getTime() <= 90 * 24 * 60 * 60 * 1000;

                return (
                  <tr key={med.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{med.name}</div>
                      <div className="text-[11px] text-slate-400">{med.scientificName}</div>
                      {med.requiresPrescription && (
                        <span className="inline-block mt-0.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          وصفة طبية فقط Rx
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {med.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-500">
                      <div className="flex items-center gap-1">
                        <Barcode className="w-3.5 h-3.5 text-teal-600" />
                        <span>{med.barcode}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className={isLow ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-800 dark:text-slate-200'}>
                          {med.quantity} {med.unit}
                        </span>
                        {isLow && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                            منخفض
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-bold">
                      <div className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        {med.price.toFixed(2)} ر.س
                      </div>
                      <div className="text-[10px] text-slate-400">
                        التكلفة: {med.costPrice.toFixed(2)} ر.س
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {med.batchNumber}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className={`font-bold text-[11px] ${isExpiring ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        {med.expiryDate}
                      </div>
                      {isExpiring && (
                        <span className="text-[9px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-bold">
                          قريب الانتهاء
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(med)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-100 text-slate-700 dark:text-slate-200 transition-colors"
                          title="تعديل الدواء"
                        >
                          <Edit3 className="w-4 h-4 text-teal-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف الدواء ${med.name} من قاعدة البيانات؟`)) {
                              onDeleteMedicine(med.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-700 dark:text-slate-200 transition-colors"
                          title="حذف الدواء"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingMed) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                {editingMed ? `تعديل الدواء: ${editingMed.name}` : 'إضافة دواء جديد إلى قاعدة بيانات SQL Server'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMed(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">اسم الدواء التجاري *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">الاسم العلمي / المادة الفعالة *</label>
                  <input
                    type="text"
                    required
                    value={formData.scientificName || ''}
                    onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">الفئة الصيدلانية</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">رمز الباركوم (Barcode) *</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">سعر البيع للمريض (ر.س) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500 font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">سعر التكلفة / الشراء (ر.س)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">الكمية بالمخزن</label>
                  <input
                    type="number"
                    value={formData.quantity || 0}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">الحد الأدنى للتنبيه</label>
                  <input
                    type="number"
                    value={formData.minQuantity || 10}
                    onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">رقم التشغيلة (Batch Number)</label>
                  <input
                    type="text"
                    value={formData.batchNumber || ''}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">تاريخ الانتهاء (Expiry Date)</label>
                  <input
                    type="date"
                    value={formData.expiryDate || ''}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">تعليمات الاستخدام والشرح للمريض</label>
                <textarea
                  rows={2}
                  value={formData.usageInstructions || ''}
                  onChange={(e) => setFormData({ ...formData, usageInstructions: e.target.value })}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="requiresPrescription"
                  checked={formData.requiresPrescription || false}
                  onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="requiresPrescription" className="font-bold text-slate-800 dark:text-slate-200">
                  يتطلب وصفة طبية إلزامية لصرفه (Rx Required)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMed(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-500 transition-colors"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
