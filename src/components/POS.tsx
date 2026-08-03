import React, { useState } from 'react';
import { Medicine, Patient, SaleItem, SaleInvoice, User } from '../types';
import { 
  ShoppingCart, 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  User as UserIcon, 
  CreditCard, 
  CheckCircle, 
  Printer, 
  AlertTriangle,
  Receipt,
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface POSProps {
  medicines: Medicine[];
  patients: Patient[];
  currentUser: User;
  onCompleteSale: (invoice: SaleInvoice) => void;
}

export const POS: React.FC<POSProps> = ({
  medicines,
  patients,
  currentUser,
  onCompleteSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'insurance'>('card');
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [completedInvoice, setCompletedInvoice] = useState<SaleInvoice | null>(null);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Search filtered medicines
  const filteredMeds = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.barcode.includes(searchQuery) ||
      m.qrCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add medicine to cart
  const addToCart = (med: Medicine) => {
    if (med.quantity <= 0) {
      alert(`عذراً، الدواء ${med.name} غير متوفر بالرصيد حالياً.`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.medicineId === med.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity;
        if (currentQty >= med.quantity) {
          alert(`لا توجد كمية كافية بالمخزن! المتاح: ${med.quantity}`);
          return prev;
        }
        updated[existingIndex].quantity += 1;
        updated[existingIndex].total = (updated[existingIndex].quantity * updated[existingIndex].unitPrice) - updated[existingIndex].discount;
        return updated;
      } else {
        return [
          ...prev,
          {
            medicineId: med.id,
            medicineName: med.name,
            unitPrice: med.price,
            quantity: 1,
            discount: 0,
            total: med.price,
            barcode: med.barcode,
          },
        ];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (medId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.medicineId === medId) {
            const med = medicines.find((m) => m.id === medId);
            const maxAvailable = med ? med.quantity : 999;
            const newQty = item.quantity + delta;

            if (newQty > maxAvailable) {
              alert(`الكمية المتاحة بالنظام هي ${maxAvailable} فقط.`);
              return item;
            }
            if (newQty <= 0) return null;

            const total = (newQty * item.unitPrice) - item.discount;
            return { ...item, quantity: newQty, total };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  // Check Allergy Warning for selected patient
  const allergyWarnings: string[] = [];
  if (selectedPatient && selectedPatient.allergies.length > 0) {
    cart.forEach((cartItem) => {
      const med = medicines.find((m) => m.id === cartItem.medicineId);
      if (med) {
        selectedPatient.allergies.forEach((allergy) => {
          const matched = med.activeIngredients.some((ing) =>
            ing.toLowerCase().includes(allergy.toLowerCase())
          ) || med.name.toLowerCase().includes(allergy.toLowerCase());
          if (matched) {
            allergyWarnings.push(`تنبيه! المريض ${selectedPatient.name} يتحسس من [${allergy}] والدواء المختصر [${med.name}] يحتوي عليها!`);
          }
        });
      }
    });
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0);
  const totalDiscount = itemDiscounts + globalDiscount;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const vatTax = taxableAmount * 0.15; // 15% VAT
  const grandTotal = taxableAmount + vatTax;

  // Finalize Transaction
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('السلة فارغة!');
      return;
    }

    if (allergyWarnings.length > 0) {
      const confirmProceed = window.confirm(
        `تنبيه تحسس خطير للمريض!\n\n${allergyWarnings.join('\n')}\n\nهل أنت متأكد من صرف هذه الوصفة على مسؤوليتك؟`
      );
      if (!confirmProceed) return;
    }

    const invoiceNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice: SaleInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      date: new Date().toISOString(),
      patientId: selectedPatient?.id,
      patientName: selectedPatient?.name || 'عميل نقدي',
      pharmacistId: currentUser.id,
      pharmacistName: currentUser.name,
      items: [...cart],
      subtotal,
      tax: vatTax,
      discount: totalDiscount,
      grandTotal,
      paymentMethod,
      status: 'completed',
    };

    onCompleteSale(newInvoice);
    setCompletedInvoice(newInvoice);
    setCart([]);
  };

  // Export Receipt to PDF
  const exportReceiptPDF = () => {
    const input = document.getElementById('receipt-print-area');
    if (!input) return;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${completedInvoice?.invoiceNumber}.pdf`);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6rem)]">
      
      {/* Left Column: Medicine Catalog & Search (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4 h-full overflow-hidden">
        
        {/* Search Bar & Barcode Scanner */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم التجاري، المادة الفعالة، أو امسح الـ Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm border-none focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <button
            onClick={() => setSearchQuery('6291100123456')}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-bold border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors shrink-0"
            title="محاكاة مسح الباركوم بالليزر"
          >
            <Barcode className="w-4 h-4" />
            مسح الباركوم
          </button>
        </div>

        {/* Medicines Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredMeds.map((med) => {
            const isOut = med.quantity <= 0;
            return (
              <div
                key={med.id}
                onClick={() => !isOut && addToCart(med)}
                className={`bg-white dark:bg-slate-900 p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isOut
                    ? 'opacity-50 border-slate-200 dark:border-slate-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {med.category}
                    </span>
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400">
                      {med.price.toFixed(2)} ر.س
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                    {med.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {med.scientificName}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <span className={`font-bold text-[11px] ${med.quantity <= med.minQuantity ? 'text-amber-500' : 'text-slate-500'}`}>
                    الكمية: {med.quantity} {med.unit}
                  </span>
                  
                  <span className="p-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-300 font-bold">
                    <Plus className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Right Column: Checkout Shopping Cart (5 Cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
        
        <div>
          {/* Patient Selector Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                سلة المبيعات والتسليم
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {cart.reduce((s, i) => s + i.quantity, 0)} منتج
            </span>
          </div>

          {/* Patient Dropdown */}
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              اختيار المريض المسجل (اختياري)
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-2.5 rounded-xl outline-none border border-transparent focus:border-teal-500"
            >
              <option value="">عميل نقدي بدون سجل</option>
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.name} - ({pat.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Allergy Alert Banner if matched */}
          {allergyWarnings.length > 0 && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl space-y-1">
              {allergyWarnings.map((warn, i) => (
                <p key={i} className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-start gap-1">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  {warn}
                </p>
              ))}
            </div>
          )}

          {/* Cart List */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs">السلة فارغة. انقر على أي دواء لإضافته للفاتورة.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.medicineId} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex-1 pr-2">
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {item.medicineName}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      {item.unitPrice.toFixed(2)} ر.س / عبوة
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 px-2">
                    <button
                      onClick={() => updateQuantity(item.medicineId, -1)}
                      className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-extrabold w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.medicineId, 1)}
                      className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-left font-black text-xs text-slate-900 dark:text-slate-100 min-w-16">
                    {item.total.toFixed(2)} ر.س
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Summary & Checkout Action */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>المجموع الفرعي:</span>
              <span className="font-bold">{subtotal.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>ضريبة القيمة المضافة VAT (15%):</span>
              <span className="font-bold">{vatTax.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-teal-600 font-bold text-sm pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>الإجمالي النهائي المطلوب:</span>
              <span className="text-base font-black">{grandTotal.toFixed(2)} ر.س</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                paymentMethod === 'card'
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
              }`}
            >
              مدى / بطاقة
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                paymentMethod === 'cash'
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
              }`}
            >
              نقداً Cash
            </button>
            <button
              onClick={() => setPaymentMethod('insurance')}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                paymentMethod === 'insurance'
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
              }`}
            >
              تأمين طبي
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-extrabold text-sm shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-98 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            إتمام عملية الدفع وطباعة الفاتورة
          </button>
        </div>

      </div>

      {/* Completed Invoice Printable Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            
            <div id="receipt-print-area" className="p-4 bg-white text-slate-900 rounded-2xl">
              <div className="text-center pb-4 border-b border-dashed border-slate-300">
                <h3 className="text-xl font-black tracking-tight text-teal-800">صيدلية PharmaCare AI</h3>
                <p className="text-xs text-slate-500">فاتورة ضريبية مبسطة (POS Receipt)</p>
                <p className="text-[10px] text-slate-400 mt-1">الرقم الضريبي: 310992831200003</p>
                <p className="text-[11px] font-bold text-slate-700 mt-2">{completedInvoice.invoiceNumber}</p>
                <p className="text-[10px] text-slate-500">{new Date(completedInvoice.date).toLocaleString('ar-SA')}</p>
              </div>

              <div className="py-3 text-xs border-b border-dashed border-slate-300">
                <p><strong>المريض:</strong> {completedInvoice.patientName}</p>
                <p><strong>الصيدلي:</strong> {completedInvoice.pharmacistName}</p>
                <p><strong>طريقة الدفع:</strong> {completedInvoice.paymentMethod}</p>
              </div>

              <div className="py-3 space-y-2 text-xs border-b border-dashed border-slate-300">
                {completedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{item.medicineName}</p>
                      <p className="text-[10px] text-slate-500">{item.quantity} x {item.unitPrice.toFixed(2)} ر.س</p>
                    </div>
                    <span className="font-bold">{item.total.toFixed(2)} ر.س</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي:</span>
                  <span>{completedInvoice.subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الضريبة VAT (15%):</span>
                  <span>{completedInvoice.tax.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between font-black text-sm text-teal-900 pt-1 border-t border-slate-200">
                  <span>الإجمالي الكلي:</span>
                  <span>{completedInvoice.grandTotal.toFixed(2)} ر.س</span>
                </div>
              </div>

              <div className="text-center pt-4 text-[10px] text-slate-400 border-t border-slate-200 mt-3">
                شكرًا لثقتكم بشركة PharmaCare AI - تمنياتنا لكم بالشفاء العاجل!
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={exportReceiptPDF}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                تحميل الفاتورة PDF
              </button>
              <button
                onClick={() => setCompletedInvoice(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
