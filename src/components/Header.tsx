import React from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { 
  Bot, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  ShieldCheck, 
  UserCheck, 
  Activity,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  lowStockCount: number;
  expiringCount: number;
  onOpenAlerts: () => void;
  onQuickSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  darkMode,
  onToggleDarkMode,
  lowStockCount,
  expiringCount,
  onOpenAlerts,
  onQuickSearch,
}) => {
  const totalAlerts = lowStockCount + expiringCount;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#E0E3E1] dark:border-slate-800 transition-colors">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#006A6A] flex items-center justify-center text-white shadow-sm shadow-[#006a6a33]">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#002020] dark:text-teal-300">
                نظام الصيدلية الذكي Pro2Plas
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#E0F3F2] text-[#006A6A] dark:bg-teal-950 dark:text-teal-300 rounded-full border border-[#B2E0DF] dark:border-teal-800">
                Pro v2.5
              </span>
            </div>
            <p className="text-xs text-[#566262] dark:text-slate-400">
              إدارة شاملة ومساعد طبي مدعوم بالذكاء الاصطناعي
            </p>
          </div>
        </div>

        {/* Global Quick Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#566262]" />
            <input
              type="text"
              placeholder="بحث عن دواء، مريض، باركود، أعراض..."
              onChange={(e) => onQuickSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2 text-sm bg-[#EDF1F0] dark:bg-slate-800 text-[#191C1C] dark:text-slate-100 placeholder-[#566262] border border-[#DCE5E3] dark:border-slate-700 focus:border-[#006A6A] focus:bg-white dark:focus:bg-slate-800 rounded-full outline-none transition-all"
            />
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Notifications / Alerts Button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2.5 rounded-full bg-[#EDF1F0] dark:bg-slate-800 text-[#191C1C] dark:text-slate-200 hover:bg-[#E0E3E1] dark:hover:bg-slate-700 transition-colors"
            title="التنبيهات والمخزون"
          >
            <Bell className="w-5 h-5 text-[#566262] dark:text-slate-300" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#BA1A1A] text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-full bg-[#EDF1F0] dark:bg-slate-800 text-[#191C1C] dark:text-slate-200 hover:bg-[#E0E3E1] dark:hover:bg-slate-700 transition-colors"
            title={darkMode ? 'الوضع النهاري' : 'الوضع الليلة'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-[#006A6A]" />}
          </button>

          {/* User Persona Switcher Dropdown */}
          <div className="flex items-center gap-2 border-r border-[#E0E3E1] dark:border-slate-800 pr-3">
            <div className="relative group">
              <div className="flex items-center gap-2.5 bg-[#EDF1F0] dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-[#DCE5E3] dark:border-slate-700 cursor-pointer hover:bg-[#E0E3E1] dark:hover:bg-slate-700 transition-colors">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#006A6A]"
                />
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-[#002020] dark:text-slate-100 leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-[#566262] dark:text-teal-400 font-semibold uppercase tracking-wider">
                    {currentUser.role === 'admin' && 'مسؤول النظام'}
                    {currentUser.role === 'pharmacist' && 'صيدلي مسؤول'}
                    {currentUser.role === 'patient' && 'حساب مريض'}
                  </p>
                </div>
              </div>

              {/* Persona Options Dropdown */}
              <div className="absolute left-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#E0E3E1] dark:border-slate-800 py-2 hidden group-hover:block z-50 transition-all">
                <div className="px-3.5 py-2 border-b border-[#E0E3E1] dark:border-slate-800">
                  <p className="text-[10px] font-bold text-[#566262] uppercase tracking-widest">
                    تبديل دور المستخدم
                  </p>
                </div>
                {INITIAL_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onUserChange(user)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs text-right hover:bg-[#F1F3F2] dark:hover:bg-slate-800 transition-colors ${
                      currentUser.id === user.id ? 'bg-[#CCE8E8] dark:bg-teal-950/40 text-[#002020] dark:text-teal-300 font-bold' : 'text-[#191C1C] dark:text-slate-300'
                    }`}
                  >
                    <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                    <div className="flex-1">
                      <p className="leading-tight font-semibold">{user.name}</p>
                      <p className="text-[10px] text-[#566262]">
                        {user.role === 'admin' ? 'صلاحيات كاملة' : user.role === 'pharmacist' ? 'لوحة البيع والمخزون' : 'خدمات المرضى والتذكير'}
                      </p>
                    </div>
                    {currentUser.id === user.id && <UserCheck className="w-4 h-4 text-[#006A6A]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
