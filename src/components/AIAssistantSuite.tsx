import React, { useState } from 'react';
import { Medicine, Patient, PrescriptionItem, SymptomAnalysisResult, PrescriptionOCRResult, DrugIdentificationResult, DrugInteractionResult, DosageCalculationResult, LabAnalysisResult, RadiologyAnalysisResult, ChatMessage } from '../types';
import { 
  Sparkles, 
  Stethoscope, 
  FileSearch, 
  Camera, 
  ShieldAlert, 
  Calculator, 
  Microscope, 
  Activity, 
  MessageSquare, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  Plus,
  Send,
  Loader2,
  Info,
  Pill,
  ShoppingCart
} from 'lucide-react';

interface AIAssistantSuiteProps {
  medicines: Medicine[];
  patients: Patient[];
  onAddToCart?: (medName: string, qty: number) => void;
}

export const AIAssistantSuite: React.FC<AIAssistantSuiteProps> = ({
  medicines,
  patients,
  onAddToCart,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'symptoms' | 'ocr' | 'drug-id' | 'interactions' | 'dosage' | 'lab' | 'radiology' | 'chat'
  >('symptoms');

  // Loading States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Symptom State
  const [symptomsInput, setSymptomsInput] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [symptomResult, setSymptomResult] = useState<SymptomAnalysisResult | null>(null);

  // 2. OCR State
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<PrescriptionOCRResult | null>(null);

  // 3. Drug ID State
  const [drugImage, setDrugImage] = useState<string | null>(null);
  const [drugIdResult, setDrugIdResult] = useState<DrugIdentificationResult | null>(null);

  // 4. Interactions State
  const [selectedMedsForInteraction, setSelectedMedsForInteraction] = useState<string[]>(['بانادول اكسترا (Panadol Extra)', 'فولتارين 50 ملغم (Voltaren 50mg)']);
  const [interactionResult, setInteractionResult] = useState<DrugInteractionResult | null>(null);

  // 5. Dosage State
  const [dosageMedName, setDosageMedName] = useState('أوجمنتين 1 جرام (Augmentin 1g)');
  const [dosageAge, setDosageAge] = useState(35);
  const [dosageWeight, setDosageWeight] = useState(70);
  const [dosageGender, setDosageGender] = useState('ذكر');
  const [dosageKidney, setDosageKidney] = useState(false);
  const [dosagePregnant, setDosagePregnant] = useState(false);
  const [dosageResult, setDosageResult] = useState<DosageCalculationResult | null>(null);

  // 6. Lab State
  const [labImage, setLabImage] = useState<string | null>(null);
  const [labText, setLabText] = useState('');
  const [labResult, setLabResult] = useState<LabAnalysisResult | null>(null);

  // 7. Radiology State
  const [radImage, setRadImage] = useState<string | null>(null);
  const [radScanType, setRadScanType] = useState('أشعة سينية X-Ray للصدر');
  const [radResult, setRadResult] = useState<RadiologyAnalysisResult | null>(null);

  // 8. Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c1',
      sender: 'ai',
      text: 'مرحباً بك! أنا مساعد PharmaCare AI الصيدلاني والطبي. كيف يمكنني مساعدتك اليوم في الاستشارات الدوائية أو الجرعات؟',
      timestamp: 'الآن',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Image Upload Helper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // API Call Handlers
  const handleAnalyzeSymptoms = async () => {
    if (!symptomsInput.trim()) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const p = patients.find((item) => item.id === selectedPatientId);
      const res = await fetch('/api/ai/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptomsInput,
          age: p?.age || 30,
          gender: p?.gender || 'ذكر',
          chronicDiseases: p?.chronicDiseases || [],
          allergies: p?.allergies || [],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSymptomResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء اتصال الخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPrescriptionOCR = async () => {
    if (!ocrImage) {
      alert('الرجاء رفع صورة الوصفة الطبية أولاً.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/ocr-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: ocrImage }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOcrResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل استخراج بيانات الوصفة الطبية');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDrugID = async () => {
    if (!drugImage) {
      alert('الرجاء اختيار أو التقاط صورة الدواء.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/identify-drug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: drugImage }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDrugIdResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل التعرف على صورة الدواء');
    } finally {
      setLoading(false);
    }
  };

  const handleRunInteractions = async () => {
    if (selectedMedsForInteraction.length < 2) {
      alert('اختر دواءين على الأقل لفحص التفاعلات.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugNames: selectedMedsForInteraction }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInteractionResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء فحص التفاعلات');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateDosage = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/calculate-dosage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: dosageMedName,
          age: dosageAge,
          weightKg: dosageWeight,
          gender: dosageGender,
          isPregnant: dosagePregnant,
          kidneyImpairment: dosageKidney,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDosageResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل حساب الجرعة');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeLab = async () => {
    if (!labImage && !labText) {
      alert('يرجى اختيار صورة التحليل أو كتابة نص النتيجة.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/analyze-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: labImage, textDescription: labText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLabResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل تحليل نتائج المختبر');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRadiology = async () => {
    if (!radImage) {
      alert('يرجى رفع صورة الأشعة.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/analyze-radiology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: radImage, scanType: radScanType }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRadResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل تحليل صورة الأشعة');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/smart-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      alert('فشل رد المساعد الذكي: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* AI Suite Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 animate-spin" />
            Gemini 3.6 Flash Multi-Modal AI Engine
          </div>
          <h2 className="text-2xl font-black">جناح الذكاء الاصطناعي والمساعد الطبي الذكي</h2>
          <p className="text-slate-300 text-xs mt-1">
            أدوات التشخيص المتقدمة: قراءة الوصفات OCR، التعرف على الأدوية بالصورة، التفاعلات، حاسبة الجرعات، وتحليل الأشعة والتحاليل.
          </p>
        </div>
      </div>

      {/* Sub-Tabs Navigation Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'symptoms', label: 'تحليل الأعراض', icon: Stethoscope },
          { id: 'ocr', label: 'قراءة الوصفات OCR', icon: FileSearch },
          { id: 'drug-id', label: 'التعرف على الدواء', icon: Camera },
          { id: 'interactions', label: 'التفاعلات الدوائية', icon: ShieldAlert },
          { id: 'dosage', label: 'حاسبة الجرعات', icon: Calculator },
          { id: 'lab', label: 'تحليل المختبر', icon: Microscope },
          { id: 'radiology', label: 'تحليل الأشعة', icon: Activity },
          { id: 'chat', label: 'مساعد صيدلي AI', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Display Global Error if any */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* ------------------ TAB 1: SYMPTOMS ANALYZER ------------------ */}
      {activeSubTab === 'symptoms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              إدخال الأعراض المرضية
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">ربط بمريض مسجل (تلقائي)</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border-none outline-none"
              >
                <option value="">استشارة عامة بدون تحديد مريض</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.age} سنة)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">وصف الأعراض الشامل *</label>
              <textarea
                rows={4}
                placeholder="مثلاً: أعاني من صداع شديد بالجبهة مع ارتياع في درجة الحرارة وسعال جاف منذ يومين..."
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                className="w-full text-xs p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none border-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              onClick={handleAnalyzeSymptoms}
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              تحليل الأعراض بالذكاء الاصطناعي
            </button>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {!symptomResult ? (
              <div className="py-20 text-center text-slate-400">
                <Stethoscope className="w-12 h-12 mx-auto opacity-20 mb-3" />
                <p className="text-xs font-bold">قم بكتابة الأعراض واضغط على زر التحليل لعرض التقرير السريري المبدئي.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">نتائج التحليل والتشخيص المحتمل</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    symptomResult.urgencyLevel === 'emergency' || symptomResult.urgencyLevel === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    درجة الخطورة: {symptomResult.urgencyLevel}
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-slate-500 mb-2">الحالات والتشخيصات المحتملة:</h5>
                  <div className="space-y-2">
                    {symptomResult.suspectedConditions?.map((cond, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{cond.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">{cond.probability}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{cond.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-slate-500 mb-2">الأدوية المقترحة (OTC بدون وصفة):</h5>
                  <div className="space-y-2">
                    {symptomResult.suggestedMeds?.map((med, i) => (
                      <div key={i} className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xs text-teal-900 dark:text-teal-200">{med.name}</p>
                          <p className="text-[11px] text-teal-700 dark:text-teal-400">{med.reason} - الجرعة: {med.dosage}</p>
                        </div>
                        {onAddToCart && (
                          <button
                            onClick={() => onAddToCart(med.name, 1)}
                            className="px-2.5 py-1 bg-teal-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            إضافة لـ POS
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-900 dark:text-amber-200">
                  <strong>تنبيه طبي مهم:</strong> {symptomResult.medicalDisclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------ TAB 2: PRESCRIPTION OCR READER ------------------ */}
      {activeSubTab === 'ocr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-teal-600" />
              رفع أو التقاط صورة الوصفة الطبية
            </h3>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/50 relative">
              {ocrImage ? (
                <img src={ocrImage} alt="Prescription" className="max-h-56 mx-auto rounded-xl object-contain" />
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">اختر صورة الوصفة الطبية (خط اليد أو مطبوعة)</p>
                  <p className="text-[10px] text-slate-400">يدعم صيغ JPG, PNG, WEBP</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setOcrImage)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRunPrescriptionOCR}
              disabled={loading || !ocrImage}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
              استخراج البيانات وتفريغ الوصفة OCR
            </button>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {!ocrResult ? (
              <div className="py-20 text-center text-slate-400">
                <FileSearch className="w-12 h-12 mx-auto opacity-20 mb-3" />
                <p className="text-xs font-bold">قم برفع صورة الوصفة واضغط استخراج لتحويل خط اليد إلى وصفة رقمية قابلة للصرف.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">بيانات الوصفة المستخرجة</h4>
                    <p className="text-xs text-slate-400">الطبيب: {ocrResult.doctorName} | المريض: {ocrResult.patientName || 'غير محدد'}</p>
                  </div>
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">
                    دقة OCR: {ocrResult.confidenceScore}%
                  </span>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-xs text-slate-500">الأدوية المستخرجة من الصورة:</h5>
                  {ocrResult.medicines?.map((med, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{med.medicineName}</p>
                        <p className="text-xs text-slate-500">الجرعة: {med.dosage} | التكرار: {med.frequency} | المدة: {med.duration}</p>
                        <p className="text-[11px] text-teal-600 dark:text-teal-400">{med.instructions}</p>
                      </div>
                      {onAddToCart && (
                        <button
                          onClick={() => onAddToCart(med.medicineName, med.quantity || 1)}
                          className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          إضافة لـ POS
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------ TAB 3: DRUG IDENTIFICATION ------------------ */}
      {activeSubTab === 'drug-id' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-teal-600" />
              التقاط / رفع صورة شريط أو علبة الدواء
            </h3>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/50 relative">
              {drugImage ? (
                <img src={drugImage} alt="Drug box" className="max-h-56 mx-auto rounded-xl object-contain" />
              ) : (
                <div className="space-y-2">
                  <Camera className="w-10 h-10 mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">التقط صورة لعلبة الدواء من الكاميرا أو المعرض</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setDrugImage)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRunDrugID}
              disabled={loading || !drugImage}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              التعرف على الدواء والبدائل
            </button>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {!drugIdResult ? (
              <div className="py-20 text-center text-slate-400">
                <Camera className="w-12 h-12 mx-auto opacity-20 mb-3" />
                <p className="text-xs font-bold">رفع صورة الدواء للتعرف على المادة الفعالة، السعر المتوقع، البدائل والآثار الجانبية.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-black text-xl text-slate-900 dark:text-slate-100">{drugIdResult.tradeName}</h4>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-bold">{drugIdResult.scientificName} ({drugIdResult.manufacturer})</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-bold text-slate-400 block mb-1">دواعي الاستعمال:</span>
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300">
                      {drugIdResult.uses?.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-bold text-slate-400 block mb-1">الآثار الجانبية:</span>
                    <ul className="list-disc list-inside text-slate-700 dark:text-slate-300">
                      {drugIdResult.sideEffects?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-slate-500 mb-2">البدائل المتاحة بنفس الفاعلية:</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {drugIdResult.alternatives?.map((alt, i) => (
                      <div key={i} className="p-2.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-teal-900 dark:text-teal-200">{alt.name}</span>
                        <span className="text-[10px] bg-teal-200 text-teal-900 px-1.5 py-0.5 rounded font-bold">{alt.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------ TAB 4: DRUG INTERACTIONS ------------------ */}
      {activeSubTab === 'interactions' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-teal-600" />
                فاحص ومحلل التفاعلات والتداخلات الدوائية
              </h3>
              <p className="text-xs text-slate-400">حدد دواءين أو أكثر لفحص مستوى الخطورة والتعارض الكيميائي.</p>
            </div>

            <button
              onClick={handleRunInteractions}
              disabled={loading}
              className="px-5 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              فحص التفاعلات الآن
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2 block">الأدوية المحددة للفحص:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {medicines.map((m) => {
                  const isChecked = selectedMedsForInteraction.includes(m.name);
                  return (
                    <label key={m.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMedsForInteraction([...selectedMedsForInteraction, m.name]);
                          } else {
                            setSelectedMedsForInteraction(selectedMedsForInteraction.filter((n) => n !== m.name));
                          }
                        }}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{m.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              {interactionResult && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">مستوى خطورة التداخل:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      interactionResult.riskLevel === 'severe' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {interactionResult.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{interactionResult.summary}</p>

                  <div className="space-y-2">
                    {interactionResult.interactions?.map((inter, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border text-xs">
                        <p className="font-bold text-rose-600">{inter.drug1} ↔ {inter.drug2}</p>
                        <p className="text-slate-500 mt-0.5">{inter.mechanism}</p>
                        <p className="text-teal-600 font-bold mt-1">الاحتياط: {inter.precaution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------ TAB 5: DOSAGE CALCULATOR ------------------ */}
      {activeSubTab === 'dosage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-600" />
              حاسبة الجرعات الصيدلانية السريرية
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">اسم الدواء *</label>
              <input
                type="text"
                value={dosageMedName}
                onChange={(e) => setDosageMedName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">العمر (سنوات)</label>
                <input
                  type="number"
                  value={dosageAge}
                  onChange={(e) => setDosageAge(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">الوزن (كجم)</label>
                <input
                  type="number"
                  value={dosageWeight}
                  onChange={(e) => setDosageWeight(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={dosageKidney} onChange={(e) => setDosageKidney(e.target.checked)} />
                <span>يوجد قصور في وظائف الكلى (تعديل الجرعة)</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={dosagePregnant} onChange={(e) => setDosagePregnant(e.target.checked)} />
                <span>حامل / إرضاع</span>
              </label>
            </div>

            <button
              onClick={handleCalculateDosage}
              disabled={loading}
              className="w-full py-3 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              حساب الجرعة الدقيقة
            </button>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {dosageResult && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-extrabold text-base text-teal-600">{dosageResult.medicineName}</h4>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{dosageResult.calculatedDosage}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <p><strong>التكرار اليومي:</strong> {dosageResult.dailyFrequency}</p>
                  <p><strong>الحد الأقصى اليومي:</strong> {dosageResult.maxDailyLimit}</p>
                  <p><strong>الشرح السريري:</strong> {dosageResult.reasoning}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------ TAB 6: LAB ANALYSIS ------------------ */}
      {activeSubTab === 'lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Microscope className="w-5 h-5 text-teal-600" />
              رفع ورقة فحص المختبر (Lab Test)
            </h3>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/50 relative">
              {labImage ? (
                <img src={labImage} alt="Lab Sheet" className="max-h-48 mx-auto rounded-xl object-contain" />
              ) : (
                <p className="text-xs font-bold text-slate-500">رفع صورة ورقة نتائج التحليل المخبري</p>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setLabImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <button
              onClick={handleAnalyzeLab}
              disabled={loading}
              className="w-full py-3 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Microscope className="w-4 h-4" />}
              تحليل نتائج المختبر
            </button>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {labResult && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{labResult.testType}</h4>
                <p className="text-xs text-slate-500">{labResult.summary}</p>

                <div className="space-y-2">
                  {labResult.abnormalParameters?.map((param, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{param.parameter}: </span>
                        <span className="font-mono">{param.value}</span> (المعدل: {param.referenceRange})
                      </div>
                      <span className="px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800">{param.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------ TAB 7: RADIOLOGY ------------------ */}
      {activeSubTab === 'radiology' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              رفع صورة الأشعة (X-Ray, MRI, CT Scan)
            </h3>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/50 relative">
              {radImage ? (
                <img src={radImage} alt="Radiology Scan" className="max-h-48 mx-auto rounded-xl object-contain" />
              ) : (
                <p className="text-xs font-bold text-slate-500">رفع صورة الأشعة التشخيصية</p>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setRadImage)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <button
              onClick={handleAnalyzeRadiology}
              disabled={loading || !radImage}
              className="w-full py-3 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              تحليل القراءة الأولية للأشعة
            </button>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {radResult && (
              <div className="space-y-3">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{radResult.scanType} - {radResult.bodyPart}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">{radResult.detailedAnalysis}</p>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 rounded-xl text-xs text-amber-900">
                  {radResult.disclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------ TAB 8: AI CHAT PHARMACIST ------------------ */}
      {activeSubTab === 'chat' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[550px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">المساعد الصيدلي التفاعلي (AI Chat Pharmacist)</h3>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-bl-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-br-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="text-[9px] opacity-70 block text-left mt-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="اكتب استفسارك الطبي أو الصيدلاني هنا..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
              className="flex-1 p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs outline-none border-none"
            />
            <button
              onClick={handleSendChatMessage}
              disabled={loading}
              className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
