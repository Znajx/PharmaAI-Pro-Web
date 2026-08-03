import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Sparkles, 
  FileText, 
  Users, 
  Truck, 
  Clock, 
  BarChart3, 
  Database,
  ChevronLeft
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'pos' 
  | 'inventory' 
  | 'ai-suite' 
  | 'prescriptions' 
  | 'patients' 
  | 'suppliers' 
  | 'reminders' 
  | 'reports' 
  | 'sql-studio';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userRole: UserRole;
  lowStockCount: number;
  expiringCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  lowStockCount,
  expiringCount,
}) => {
  const mainNavItems = [
    {
      id: 'dashboard' as TabType,
      label: 'لوحة التحكم',
      icon: LayoutDashboard,
      roles: ['admin', 'pharmacist', 'patient'],
      badge: null,
    },
    {
      id: 'pos' as TabType,
      label: 'نقطة البيع الكاشير',
      icon: ShoppingCart,
      roles: ['admin', 'pharmacist'],
      badge: 'POS',
      badgeColor: 'bg-[#006A6A] text-white',
    },
    {
      id: 'inventory' as TabType,
      label: 'المخزون والطلبات',
      icon: Package,
      roles: ['admin', 'pharmacist'],
      badge: lowStockCount > 0 ? `${lowStockCount} حرجة` : null,
      badgeColor: 'bg-[#BA1A1A] text-white',
    },
    {
      id: 'prescriptions' as TabType,
      label: 'الوصفات وقارئ OCR',
      icon: FileText,
      roles: ['admin', 'pharmacist', 'patient'],
      badge: null,
    },
    {
      id: 'patients' as TabType,
      label: 'إدارة المرضى والسجلات',
      icon: Users,
      roles: ['admin', 'pharmacist'],
      badge: null,
    },
    {
      id: 'suppliers' as TabType,
      label: 'الموردين والشركات',
      icon: Truck,
      roles: ['admin', 'pharmacist'],
      badge: null,
    },
    {
      id: 'reminders' as TabType,
      label: 'التذكير بالجرعات',
      icon: Clock,
      roles: ['admin', 'pharmacist', 'patient'],
      badge: null,
    },
    {
      id: 'reports' as TabType,
      label: 'المبيعات والتقارير',
      icon: BarChart3,
      roles: ['admin', 'pharmacist'],
      badge: 'PDF',
    },
  ];

  const aiNavItems = [
    {
      id: 'ai-suite' as TabType,
      label: 'جناح Gemini الاصطناعي',
      icon: Sparkles,
      roles: ['admin', 'pharmacist', 'patient'],
      badge: 'AI',
      badgeColor: 'bg-[#006A6A] text-white',
    },
    {
      id: 'sql-studio' as TabType,
      label: 'استوديو SQL Server',
      icon: Database,
      roles: ['admin', 'pharmacist', 'patient'],
      badge: '2022',
      badgeColor: 'bg-[#002020] text-white',
    },
  ];

  const filterItems = (items: typeof mainNavItems) => items.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-l border-[#E0E3E1] dark:border-slate-800 flex flex-col py-6 h-[calc(100vh-4rem)] sticky top-16 shrink-0 transition-colors">
      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        
        {/* Main Section */}
        <div>
          <p className="text-[10px] font-bold text-[#566262] dark:text-slate-400 uppercase tracking-widest mb-3 px-2">
            القائمة الرئيسية
          </p>
          <ul className="space-y-1">
            {filterItems(mainNavItems).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#CCE8E8] dark:bg-teal-950/60 text-[#002020] dark:text-teal-200 font-bold'
                        : 'text-[#566262] dark:text-slate-300 hover:bg-[#F1F3F2] dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-5 rounded-full transition-all ${isActive ? 'bg-[#006A6A]' : 'bg-transparent'}`} />
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#006A6A] dark:text-teal-400' : 'text-[#566262] dark:text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-[#EDF1F0] dark:bg-slate-800 text-[#566262] dark:text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* AI & Database Section */}
        <div>
          <p className="text-[10px] font-bold text-[#566262] dark:text-slate-400 uppercase tracking-widest mb-3 px-2">
            أدوات الذكاء الاصطناعي و SQL
          </p>
          <ul className="space-y-1">
            {filterItems(aiNavItems).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E0F3F2] dark:bg-teal-950/80 text-[#006A6A] dark:text-teal-200 border border-[#B2E0DF] dark:border-teal-800 font-bold'
                        : 'text-[#566262] dark:text-slate-300 hover:bg-[#F1F3F2] dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-5 rounded-full transition-all ${isActive ? 'bg-[#006A6A]' : 'bg-transparent'}`} />
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#006A6A] dark:text-teal-400' : 'text-[#566262] dark:text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-[#EDF1F0] dark:bg-slate-800 text-[#566262] dark:text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

      </div>

      {/* Footer Status Box */}
      <div className="mt-auto px-4">
        <div className="bg-[#002020] p-4 rounded-2xl text-white shadow-sm">
          <p className="text-[10px] opacity-70 mb-1 font-mono">حالة النظام والاتصال</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">SQL Server 2022</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-mono">متصل</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
