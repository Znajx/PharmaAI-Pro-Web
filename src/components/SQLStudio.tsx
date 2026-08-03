import React, { useState } from 'react';
import { SQL_SERVER_SCRIPT, VISUAL_STUDIO_GUIDE } from '../data/sqlScript';
import { Database, Copy, Check, Terminal, Server, Code2, Play } from 'lucide-react';

export const SQLStudio: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'vs2012' | 'vs2022' | 'connection'>('script');

  const handleCopyScript = () => {
    navigator.clipboard.writeText(SQL_SERVER_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-purple-400" />
            SQL Server 2012-2022 & Visual Studio Integration
          </div>
          <h2 className="text-2xl font-black">استديو قاعدة بيانات SQL Server و Visual Studio</h2>
          <p className="text-purple-200 text-xs mt-1">
            مخصص لتشغيل المشروع مباشرة على Visual Studio 2012 و Visual Studio 2022 مع SQL Server Management Studio.
          </p>
        </div>

        <button
          onClick={handleCopyScript}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          {copied ? 'تم نسخ سكريبت SQL!' : 'نسخ كود SQL Server كاملاً'}
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('script')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'script' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          كود سكريبت SQL T-SQL
        </button>
        <button
          onClick={() => setActiveTab('vs2012')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'vs2012' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          دليل التشغيل Visual Studio 2012
        </button>
        <button
          onClick={() => setActiveTab('vs2022')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'vs2022' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          دليل التشغيل Visual Studio 2022
        </button>
        <button
          onClick={() => setActiveTab('connection')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'connection' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          نصوص الاتصال Connection Strings
        </button>
      </div>

      {/* Script Code Viewer */}
      {activeTab === 'script' && (
        <div className="bg-slate-950 text-slate-100 p-5 rounded-3xl border border-slate-800 shadow-2xl relative font-mono text-xs overflow-x-auto max-h-[500px]">
          <pre>{SQL_SERVER_SCRIPT}</pre>
        </div>
      )}

      {/* VS 2012 Guide */}
      {activeTab === 'vs2012' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-600" />
            خطوات تشغيل قاعدة البيانات على Visual Studio 2012
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
            <li>افتح <strong>Visual Studio 2012</strong>.</li>
            <li>اذهب إلى القائمة العلوي: <strong>View ← Server Explorer</strong>.</li>
            <li>انقر بزر الفأرة الأيمن على <strong>Data Connections</strong> واختر <strong>Add Connection...</strong>.</li>
            <li>أدخل اسم السيرفر الخاص بك (مثل: <code>.</code> أو <code>(localdb)\v11.0</code> أو <code>localhost\SQLEXPRESS</code>).</li>
            <li>اكتب اسم قاعدة البيانات <code>PharmaCareDB</code> ثم اضغط OK.</li>
            <li>انقر على زر <strong>New Query</strong>، وقم بلصق سكريبت SQL الموجود بالزر أعلاه، ثم اضغط <strong>Execute (F5)</strong>.</li>
          </ol>
        </div>
      )}

      {/* VS 2022 Guide */}
      {activeTab === 'vs2022' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-600" />
            خطوات تشغيل قاعدة البيانات على Visual Studio 2022 & SSMS
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
            <li>افتح <strong>Visual Studio 2022</strong> أو <strong>SQL Server Management Studio (SSMS 19/20)</strong>.</li>
            <li>من القائمة: <strong>View ← SQL Server Object Explorer</strong>.</li>
            <li>قم بتوصيل محرك SQL Server local (مثل <code>(localdb)\MSSQLLocalDB</code>).</li>
            <li>انقر على Databases ثم <strong>Add New Database</strong> باسم <code>PharmaCareDB</code>.</li>
            <li>افتح نافذة الاستعلام <strong>New Query</strong>، والصق كود SQL واضغط <strong>Execute</strong> لتكوين جميع الجداول والإجراءات المخزنة (Stored Procedures).</li>
          </ol>
        </div>
      )}

      {/* Connection Strings */}
      {activeTab === 'connection' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">نصوص الاتصال الجاهزة للاستخدام في C# ASP.NET / Entity Framework</h3>
          
          <div className="space-y-3">
            <div>
              <p className="font-bold text-slate-500 mb-1">LocalDB (Visual Studio Default):</p>
              <code className="block p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono">
                Server=(localdb)\MSSQLLocalDB;Database=PharmaCareDB;Trusted_Connection=True;MultipleActiveResultSets=true;
              </code>
            </div>

            <div>
              <p className="font-bold text-slate-500 mb-1">SQL Express Server Instance:</p>
              <code className="block p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono">
                Server=localhost\SQLEXPRESS;Database=PharmaCareDB;Trusted_Connection=True;TrustServerCertificate=True;
              </code>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
