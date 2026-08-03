export type UserRole = 'admin' | 'pharmacist' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  licenseNumber?: string;
}

export interface Medicine {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  barcode: string;
  qrCode: string;
  price: number;
  costPrice: number;
  quantity: number;
  minQuantity: number;
  unit: string;
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  supplierId: string;
  manufacturer: string;
  activeIngredients: string[];
  dosageForm: string;
  sideEffects: string[];
  usageInstructions: string;
  contraindications: string[];
  localAlternatives: string[];
  importedAlternatives: string[];
  cheaperAlternatives: string[];
  requiresPrescription: boolean;
  image?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  companyName: string;
  rating: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'ذكر' | 'أنثى';
  phone: string;
  email: string;
  bloodGroup?: string;
  allergies: string[];
  chronicDiseases: string[];
  kidneyImpairment?: boolean;
  liverImpairment?: boolean;
  isPregnant?: boolean;
  weightKg?: number;
  medicalHistoryNotes?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
}

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  total: number;
  barcode: string;
}

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  patientId?: string;
  patientName?: string;
  pharmacistId: string;
  pharmacistName: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'insurance';
  status: 'completed' | 'returned' | 'cancelled';
}

export interface PrescriptionItem {
  medicineName: string;
  scientificName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  imageUrl?: string;
  notes?: string;
  status: 'active' | 'dispensed' | 'expired';
}

export interface MedicationReminder {
  id: string;
  patientId: string;
  patientName?: string;
  medicineName: string;
  dosage: string;
  time: string; // HH:mm
  frequencyDays?: string;
  frequency?: string;
  takenToday?: boolean;
  taken?: boolean;
  snoozedUntil?: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
}

export type DoseReminder = MedicationReminder;

// AI Interfaces
export interface SymptomAnalysisResult {
  suspectedConditions: { name: string; probability: string; description: string }[];
  suggestedMeds: { name: string; reason: string; dosage: string }[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  urgencyReason: string;
  generalAdvice: string;
  medicalDisclaimer: string;
}

export interface PrescriptionOCRResult {
  doctorName: string;
  patientName: string;
  date: string;
  medicines: PrescriptionItem[];
  notes: string;
  confidenceScore: number;
}

export interface DrugIdentificationResult {
  tradeName: string;
  scientificName: string;
  activeIngredients: string[];
  manufacturer: string;
  dosageForm: string;
  uses: string[];
  sideEffects: string[];
  warnings: string[];
  estimatedPrice: string;
  alternatives: { name: string; type: 'موهلي' | 'مستورد' | 'أرخص' | 'نفس المادة' }[];
}

export interface DrugInteractionResult {
  riskLevel: 'safe' | 'minor' | 'moderate' | 'severe';
  riskScorePercentage: number;
  summary: string;
  interactions: {
    drug1: string;
    drug2: string;
    severity: 'طافية' | 'متوسطة' | 'خطيرة جداً';
    mechanism: string;
    precaution: string;
  }[];
  alternativesSuggested: string[];
}

export interface DosageCalculationResult {
  medicineName: string;
  calculatedDosage: string;
  dailyFrequency: string;
  maxDailyLimit: string;
  patientCategory: string;
  specialWarnings: string[];
  reasoning: string;
}

export interface LabAnalysisResult {
  testType: string;
  summary: string;
  abnormalParameters: { parameter: string; value: string; referenceRange: string; status: 'مرتفع' | 'منخفض' | 'طبيعي'; meaning: string }[];
  clinicalSignificance: string;
  suggestedFollowUp: string;
  disclaimer: string;
}

export interface RadiologyAnalysisResult {
  scanType: string; // X-Ray, MRI, CT
  bodyPart: string;
  preliminaryFindings: string[];
  detailedAnalysis: string;
  urgency: 'عادي' | 'متابعة' | 'عاجل جداً';
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}
