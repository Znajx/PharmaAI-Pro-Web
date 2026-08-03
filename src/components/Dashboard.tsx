import React from 'react';
import { Medicine, SaleInvoice, Patient, UserRole } from '../types';
import { TabType } from './Sidebar';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle, 
  Sparkles, 
  ShoppingCart, 
  FileText, 
  ShieldCheck, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardProps {
  medicines: Medicine[];
  sales: SaleInvoice[];
  patients: Patient[];
  userRole: UserRole;
  onNavigate: (tab: TabType) => void;
  onOpenLowStock: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  medicines,
  sales,
  patients,
  userRole,
  onNavigate,
  onOpenLowStock,
}) => {
  // Financial metrics calculation
  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalProfit = sales.reduce((sum, s) => {
    const invoiceCost = s.items.reduce((cSum, item) => {
      const med = medicines.find(m => m.id === item.medicineId);
      const unitCost = med ? med.costPrice : item.unitPrice * 0.7;
      return cSum + (unitCost * item.quantity);
    }, 0);
    return sum + (s.grandTotal - invoiceCost);
  }, 0);

  // Inventory metrics
  const lowStockMeds = medicines.filter((m) => m.quantity <= m.minQuantity);
  const expiringMeds = medicines.filter((m) => {
    const exp = new Date(m.expiryDate).getTime();
    const now = new Date().getTime();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    return exp - now <= ninetyDays;
  });

  // Recharts Monthly Sales Data
  const monthlyData = [
    { month: 'يناير', sales: 12400, profit: 4200 },
    { month: 'فبراير', sales: 15800, profit: 5300 },
    { month: 'مارس', sales: 18200, profit: 6400 },
    { month: 'أبريل', sales: 14900, profit: 5100 },
    { month: 'مايو', sales: 21500, profit: 7800 },
    { month: 'يونيو', sales: 24800, profit: 9200 },
    { month: 'يوليو', sales: 28900, profit: 10400 },
    { month: 'أغسطس', sales: totalRevenue + 12000, profit: totalProfit + 4500 },
  ];

  // Category Distribution Pie Data
  const categoriesMap: Record<string, number> = {};
  medicines.forEach((m) => {
    categoriesMap[m.category] = (categoriesMap[m.category] || 0) + 1;
  });
  const categoryPieData = Object.entries(categoriesMap).map(([name, value]) => ({ name, value }));

  const COLORS = ['#006A6A', '#0284c7', '#2563eb', '#7c3aed', '#db2777', '#d97706', '#059669'];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="bg-[#002020] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#006A6A]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#CCE8E8] font-bold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4 text-[#006A6A] bg-white rounded-full p-0.5" />
              نظام إدارة الصيدلية الذكي Pro2Plas
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              لوحة التحكم والمتابعة المباشرة
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              إدارة شاملة مدعومة بالذكاء الاصطناعي لتتبع المبيعات، معالجة الوصفات الطبية OCR، ومراقبة المخزون بالاتصال المباشر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {userRole !== 'patient' && (
              <button
                onClick={() => onNavigate('pos')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#006A6A] hover:bg-[#005252] text-white font-bold text-sm transition-all shadow-md active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                بيع جديد (POS)
              </button>
            )}

            <button
              onClick={() => onNavigate('ai-suite')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all backdrop-blur-md border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-[#CCE8E8]" />
              تحليل الوصفات OCR
            </button>
          </div>
        </div>
      </div>

      {/* Warning Banners if Low Stock or Expiring */}
      {(lowStockMeds.length > 0 || expiringMeds.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockMeds.length > 0 && (
            <div className="bg-[#FFFBFA] border border-[#BA1A1A]/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#BA1A1A]/10 text-[#BA1A1A] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#BA1A1A]">
                    تنبيه نواقص المخزون ({lowStockMeds.length} أدوية)
                  </h4>
                  <p className="text-xs text-[#566262]">
                    تنبيه فوري: إعادة طلب الأدوية التي وصلت الحد الأدنى.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="px-3 py-1.5 text-xs font-bold text-[#BA1A1A] bg-[#BA1A1A]/10 rounded-xl hover:bg-[#BA1A1A]/20 transition-colors shrink-0"
              >
                عرض النواقص
              </button>
            </div>
          )}

          {expiringMeds.length > 0 && (
            <div className="bg-white border border-[#E0E3E1] rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#002020]">
                    تنبيه الصلاحية القريبة ({expiringMeds.length} أدوية)
                  </h4>
                  <p className="text-xs text-[#566262]">
                    أدوية تنتهي صلاحيتها خلال الأيام القادمة.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="px-3 py-1.5 text-xs font-bold text-[#006A6A] bg-[#E0F3F2] rounded-xl hover:bg-[#CCE8E8] transition-colors shrink-0"
              >
                مراجعة
              </button>
            </div>
          )}
        </div>
      )}

      {/* Top Stats Grid (Professional Polish style) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat 1: Today Sales */}
        <div className="bg-white p-5 rounded-3xl border border-[#E0E3E1] shadow-sm">
          <p className="text-sm text-[#566262] mb-1">إجمالي المبيعات اليوم</p>
          <h3 className="text-2xl font-bold text-[#002020]">
            {totalRevenue.toLocaleString('ar-SA')} <span className="text-xs text-[#566262]">ريال</span>
          </h3>
          <div className="mt-2 text-[11px] text-green-600 font-medium">+14% عن أمس</div>
        </div>

        {/* Stat 2: Processed Prescriptions */}
        <div className="bg-white p-5 rounded-3xl border border-[#E0E3E1] shadow-sm">
          <p className="text-sm text-[#566262] mb-1">الوصفات المعالجة</p>
          <h3 className="text-2xl font-bold text-[#002020]">48</h3>
          <div className="mt-2 text-[11px] text-[#006A6A] font-medium italic underline underline-offset-4">
            تحليل 12 منها بواسطة AI OCR
          </div>
        </div>

        {/* Stat 3: Stock Shortages */}
        <div className="bg-white p-5 rounded-3xl border border-[#E0E3E1] shadow-sm bg-[#FFFBFA]">
          <p className="text-sm text-[#BA1A1A] font-semibold mb-1">نواقص المخزون</p>
          <h3 className="text-2xl font-bold text-[#BA1A1A]">{lowStockMeds.length.toString().padStart(2, '0')}</h3>
          <div className="mt-2 text-[11px] text-red-500 font-medium">تنبيه فوري: إعادة طلب</div>
        </div>

        {/* Stat 4: Registered Patients */}
        <div className="bg-white p-5 rounded-3xl border border-[#E0E3E1] shadow-sm">
          <p className="text-sm text-[#566262] mb-1">المرضى المسجلون</p>
          <h3 className="text-2xl font-bold text-[#002020]">{patients.length}</h3>
          <div className="mt-2 text-[11px] text-[#566262]">تحديث: منذ 5 دقائق</div>
        </div>

      </section>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Graph (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E0E3E1] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#002020]">
                مخطط المبيعات والأرباح الشهرية (ريال)
              </h3>
              <p className="text-xs text-[#566262]">تحليل الأداء المالي العام للصيدلية</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E0F3F2] text-[#006A6A]">
              محدث مباشره
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006A6A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#006A6A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E3E1" />
                <XAxis dataKey="month" stroke="#566262" fontSize={12} />
                <YAxis stroke="#566262" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#002020', borderRadius: '16px', color: '#fff', border: 'none' }}
                />
                <Area type="monotone" dataKey="sales" name="المبيعات" stroke="#006A6A" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" name="الأرباح" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution Pie (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E0E3E1] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#002020]">
              توزيع الأدوية حسب الفئات
            </h3>
            <p className="text-xs text-[#566262]">التصنيف الصيدلاني للمخزون المتاح</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#002020', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {categoryPieData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate text-[#566262] font-medium">{cat.name} ({cat.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E0E3E1] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#002020]">
              سجل الفواتير والمبيعات الأخيرة
            </h3>
            <p className="text-xs text-[#566262]">آخر عمليات البيع المنفذة عبر كاشير POS</p>
          </div>
          {userRole !== 'patient' && (
            <button
              onClick={() => onNavigate('pos')}
              className="text-xs font-bold text-[#006A6A] hover:underline flex items-center gap-1"
            >
              عرض شاشة POS كاملة ←
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#F1F3F2] text-[#566262] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 rounded-r-xl">رقم الفاتورة</th>
                <th className="py-3 px-3">التاريخ والوقت</th>
                <th className="py-3 px-3">اسم المريض</th>
                <th className="py-3 px-3">عدد الأدوية</th>
                <th className="py-3 px-3">طريقة الدفع</th>
                <th className="py-3 px-3">المبلغ الإجمالي</th>
                <th className="py-3 px-3 rounded-l-xl">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3E1]">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-[#F4FBFA] transition-colors">
                  <td className="py-3.5 px-3 font-bold text-[#006A6A]">{sale.invoiceNumber}</td>
                  <td className="py-3.5 px-3 text-[#566262]">{new Date(sale.date).toLocaleDateString('ar-SA')}</td>
                  <td className="py-3.5 px-3 font-semibold text-[#191C1C]">{sale.patientName || 'عميل نقدي'}</td>
                  <td className="py-3.5 px-3 text-[#566262]">{sale.items.length} أصناف</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF1F0] text-[#566262]">
                      {sale.paymentMethod === 'cash' ? 'نقداً' : sale.paymentMethod === 'card' ? 'بطاقة مدى/شبكة' : 'تأمين طبي'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-[#002020]">{sale.grandTotal.toFixed(2)} ريال</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E0F3F2] text-[#006A6A]">
                      مكتملة
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
