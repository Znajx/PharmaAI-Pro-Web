import React from 'react';
import { SaleInvoice, Medicine } from '../types';
import { BarChart3, Printer, FileText, Download, TrendingUp, DollarSign, PackageCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportsManagerProps {
  sales: SaleInvoice[];
  medicines: Medicine[];
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({ sales, medicines }) => {
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalTax = sales.reduce((sum, s) => sum + s.tax, 0);

  const exportReportPDF = () => {
    const input = document.getElementById('financial-report-content');
    if (!input) return;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Financial_Report_PharmaCare_2026.pdf`);
    });
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-teal-600" />
            التقارير المالية والإحصائيات التصديرية (PDF & Financial Reports)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إصدار تقارير مبيعات الصيدلية، ضريبة القيمة المضافة، وحركة المخزون بطلب زر واحد.
          </p>
        </div>

        <button
          onClick={exportReportPDF}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/20 flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          تصدير التقرير المالي PDF
        </button>
      </div>

      {/* Report Area */}
      <div id="financial-report-content" className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-teal-700">تقرير المبيعات والضريبة الشامل - PharmaCare AI</h3>
            <p className="text-xs text-slate-400">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <span className="text-xs font-bold text-slate-500">الفرع الرئيسي - الرياض</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border">
            <p className="text-xs font-bold text-slate-400">إجمالي إيرادات المبيعات</p>
            <h4 className="text-xl font-black text-teal-600 mt-1">{totalRevenue.toFixed(2)} ر.س</h4>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border">
            <p className="text-xs font-bold text-slate-400">إجمالي الضريبة المحصلة VAT (15%)</p>
            <h4 className="text-xl font-black text-cyan-600 mt-1">{totalTax.toFixed(2)} ر.س</h4>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border">
            <p className="text-xs font-bold text-slate-400">عدد الأصناف بالمخزن</p>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">{medicines.length} صنف</h4>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">تفاصيل الفواتير المنفذة خلال الفترة:</h4>
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b text-slate-400">
                <th className="py-2">رقم الفاتورة</th>
                <th className="py-2">اسم المريض</th>
                <th className="py-2">التاريخ</th>
                <th className="py-2">طريقة الدفع</th>
                <th className="py-2">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sales.map((s) => (
                <tr key={s.id} className="py-2">
                  <td className="py-2 font-bold text-teal-600">{s.invoiceNumber}</td>
                  <td className="py-2">{s.patientName}</td>
                  <td className="py-2">{new Date(s.date).toLocaleDateString('ar-SA')}</td>
                  <td className="py-2">{s.paymentMethod}</td>
                  <td className="py-2 font-bold">{s.grandTotal.toFixed(2)} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
