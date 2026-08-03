import React, { useState } from 'react';
import { 
  UserRole, 
  Medicine, 
  Patient, 
  Supplier, 
  SaleInvoice, 
  Prescription, 
  DoseReminder, 
  User,
  PrescriptionItem
} from './types';
import { 
  INITIAL_MEDICINES, 
  INITIAL_PATIENTS, 
  INITIAL_SUPPLIERS, 
  INITIAL_SALES, 
  INITIAL_PRESCRIPTIONS, 
  INITIAL_REMINDERS, 
  INITIAL_USERS 
} from './data/initialData';

import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { InventoryManager } from './components/InventoryManager';
import { AIAssistantSuite } from './components/AIAssistantSuite';
import { PrescriptionsManager } from './components/PrescriptionsManager';
import { PatientsManager } from './components/PatientsManager';
import { SuppliersManager } from './components/SuppliersManager';
import { RemindersManager } from './components/RemindersManager';
import { ReportsManager } from './components/ReportsManager';
import { SQLStudio } from './components/SQLStudio';

export function App() {
  // Navigation & User Persona State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Master Application State
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [sales, setSales] = useState<SaleInvoice[]>(INITIAL_SALES);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [reminders, setReminders] = useState<DoseReminder[]>(INITIAL_REMINDERS as any);

  // Current logged in user profile depending on persona
  const currentUser: User = INITIAL_USERS.find(u => u.role === userRole) || INITIAL_USERS[0];

  // Stock counters for header / sidebar notifications
  const lowStockCount = medicines.filter((m) => m.quantity <= m.minQuantity).length;
  const expiringCount = medicines.filter((m) => {
    const exp = new Date(m.expiryDate).getTime();
    const now = new Date().getTime();
    return exp - now <= 90 * 24 * 60 * 60 * 1000;
  }).length;

  // Handlers for Inventory
  const handleAddMedicine = (newMed: Medicine) => {
    setMedicines((prev) => [newMed, ...prev]);
  };

  const handleUpdateMedicine = (updatedMed: Medicine) => {
    setMedicines((prev) => prev.map((m) => (m.id === updatedMed.id ? updatedMed : m)));
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  // Handlers for POS Sale Completion (Deducts stock automatically!)
  const handleCompleteSale = (invoice: SaleInvoice) => {
    setSales((prev) => [invoice, ...prev]);

    // Deduct stock for each sold medicine
    setMedicines((prevMeds) =>
      prevMeds.map((med) => {
        const itemInInvoice = invoice.items.find((i) => i.medicineId === med.id);
        if (itemInInvoice) {
          const newQty = Math.max(0, med.quantity - itemInInvoice.quantity);
          return { ...med, quantity: newQty };
        }
        return med;
      })
    );
  };

  // Handlers for Prescriptions
  const handleAddPrescription = (newP: Prescription) => {
    setPrescriptions((prev) => [newP, ...prev]);
  };

  const handleDispenseInPOS = (items: PrescriptionItem[]) => {
    setActiveTab('pos');
  };

  // Handlers for Patients, Suppliers, Reminders
  const handleAddPatient = (newP: Patient) => {
    setPatients((prev) => [newP, ...prev]);
  };

  const handleAddSupplier = (newS: Supplier) => {
    setSuppliers((prev) => [newS, ...prev]);
  };

  const handleAddReminder = (newR: DoseReminder) => {
    setReminders((prev) => [newR, ...prev]);
  };

  const handleToggleReminderTaken = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, taken: !r.taken } : r))
    );
  };

  return (
    <div className={`min-h-screen bg-[#F4F7F6] dark:bg-slate-950 text-[#191C1C] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 ${darkMode ? 'dark' : ''}`} dir="rtl">
      
      {/* Top Header Bar */}
      <Header
        currentUser={currentUser}
        onUserChange={(user) => setUserRole(user.role)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        lowStockCount={lowStockCount}
        expiringCount={expiringCount}
        onOpenAlerts={() => setActiveTab('inventory')}
        onQuickSearch={(query) => {
          if (query) setActiveTab('inventory');
        }}
      />

      {/* Main Body Layout with Sticky Sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={userRole}
          lowStockCount={lowStockCount}
          expiringCount={expiringCount}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-6 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          
          {activeTab === 'dashboard' && (
            <Dashboard
              medicines={medicines}
              sales={sales}
              patients={patients}
              userRole={userRole}
              onNavigate={setActiveTab}
              onOpenLowStock={() => setActiveTab('inventory')}
            />
          )}

          {activeTab === 'pos' && (
            <POS
              medicines={medicines}
              patients={patients}
              currentUser={currentUser}
              onCompleteSale={handleCompleteSale}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager
              medicines={medicines}
              suppliers={suppliers}
              onAddMedicine={handleAddMedicine}
              onUpdateMedicine={handleUpdateMedicine}
              onDeleteMedicine={handleDeleteMedicine}
            />
          )}

          {activeTab === 'ai-suite' && (
            <AIAssistantSuite
              medicines={medicines}
              patients={patients}
              onAddToCart={(medName, qty) => {
                setActiveTab('pos');
              }}
            />
          )}

          {activeTab === 'prescriptions' && (
            <PrescriptionsManager
              prescriptions={prescriptions}
              patients={patients}
              medicines={medicines}
              onAddPrescription={handleAddPrescription}
              onDispenseInPOS={handleDispenseInPOS}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsManager
              patients={patients}
              onAddPatient={handleAddPatient}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersManager
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersManager
              reminders={reminders}
              patients={patients}
              onAddReminder={handleAddReminder}
              onToggleTaken={handleToggleReminderTaken}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsManager
              sales={sales}
              medicines={medicines}
            />
          )}

          {activeTab === 'sql-studio' && (
            <SQLStudio />
          )}

        </main>

      </div>

    </div>
  );
}

export default App;
