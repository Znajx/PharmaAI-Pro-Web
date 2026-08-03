import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body limit to handle image uploads for OCR, Drug Scan, Lab & Radiology
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Initialize Gemini AI Client (Server Side Only)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MISSING_KEY",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// ===============================================================================
// AI ENDPOINTS (Gemini API Integration)
// ===============================================================================

// 1. Symptom Analyzer API
app.post("/api/ai/analyze-symptoms", async (req, res) => {
  try {
    const { symptoms, age, gender, chronicDiseases, allergies } = req.body;
    if (!symptoms) {
      return res.status(400).json({ error: "الرجاء كتابة أو تحديد الأعراض للتحليل." });
    }

    const ai = getGeminiClient();
    const prompt = `أنت مساعد طبي وصيدلي ذكي متقدم للنظام الطبي PharmaCare AI.
قم بتحليل الأعراض التالية باللغة العربية بدقة عالية:
- الأعراض المدخلة: ${symptoms}
- العمر: ${age || "غير محدد"}
- الجنس: ${gender || "غير محدد"}
- الأمراض المزمنة: ${chronicDiseases ? chronicDiseases.join(", ") : "لا يوجد"}
- الحساسية: ${allergies ? allergies.join(", ") : "لا يوجد"}

يرجى إرجاع النتيجة بصيغة JSON مطابقة للشكل التالي تماماً:
{
  "suspectedConditions": [
    { "name": "اسم الحالة أو المرض المحتمل", "probability": "مرتفع / متوسط / منخفض", "description": "شرح مختصر عن السبب" }
  ],
  "suggestedMeds": [
    { "name": "اسم الدواء المقترح (OTC بدون وصفة)", "reason": "سبب الاختيار", "dosage": "الجرعة المقترحة" }
  ],
  "urgencyLevel": "low | medium | high | emergency",
  "urgencyReason": "سبب تحديد مستوى الخطورة",
  "generalAdvice": "نصائح وإرشادات عامة للمريض",
  "medicalDisclaimer": "تنبيه طبي مهم: هذا التقييم آلي يعتمد على الذكاء الاصطناعي ولا يغني أبداً عن زيارة الطبيب المختص أو الفحص السريري."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in analyze-symptoms:", error);
    res.status(500).json({
      error: "حدث خطأ أثناء تحليل الأعراض بواسطة الذكاء الاصطناعي",
      details: error?.message,
    });
  }
});

// 2. Prescription OCR Reader API
app.post("/api/ai/ocr-prescription", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "صورة الوصفة الطبية مطلوبة." });
    }

    // Strip header if base64 data URL
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const ai = getGeminiClient();
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `أنت خبير صيدلاني متخصص في قراءة واستخراج الوصفات الطبية بخط اليد أو المطبوعة (OCR Prescription Scanner).
قم بتحليل صورة الوصفة الطبية المرفقة واستخراج المعلومات باللغة العربية مع حفظ الأسماء العلمية بالإنجليزية إذا لزم الأمر:
استخرج التالي بصيغة JSON:
{
  "doctorName": "اسم الطبيب إذا كان موجوداً أو د. غير محدد",
  "patientName": "اسم المريض إذا كان موجوداً",
  "date": "تاريخ الوصفة",
  "medicines": [
    {
      "medicineName": "اسم الدواء التجاري أو العلمي",
      "scientificName": "المادة الفعالة إن وجدت",
      "dosage": "الجرعة مثلاً 500mg أو قرص",
      "frequency": "التكرار مثلاً مرتين يومياً",
      "duration": "المدة مثلاً 7 أيام",
      "instructions": "تعليمات الاستخدام مثلاً بعد الطعام",
      "quantity": 1
    }
  ],
  "notes": "أي ملاحظات إضافية مكتوبة في الوصفة",
  "confidenceScore": 95
}`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in ocr-prescription:", error);
    res.status(500).json({
      error: "فشل استخراج بيانات الوصفة الطبية بواسطة الذكاء الاصطناعي",
      details: error?.message,
    });
  }
});

// 3. Drug Image Identification API
app.post("/api/ai/identify-drug", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "صورة الدواء مطلوبة للتعرف عليه." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          {
            text: `قم بالتعرف الدقيق على الدواء الموجود في الصورة المرفقة (علبة الدواء أو شريط الأقراص).
قم بإرجاع التقرير بصيغة JSON باللغة العربية:
{
  "tradeName": "الاسم التجاري للدواء",
  "scientificName": "الاسم العلمي / المادة الفعالة",
  "activeIngredients": ["المادة الفعالة 1", "المادة الفعالة 2"],
  "manufacturer": "الشركة المصنعة",
  "dosageForm": "الشكل الصيدلاني (أقراص/شراب/كبسولات/بخاخ)",
  "uses": ["دواعي الاستعمال 1", "دواعي الاستعمال 2"],
  "sideEffects": ["الآثار الجانبية الشائعة 1", "الآثار الجانبية 2"],
  "warnings": ["التحذيرات وموانع الاستعمال"],
  "estimatedPrice": "السعر التقريبي بالريال/الدولار",
  "alternatives": [
    { "name": "اسم البديل المحلي", "type": "محلي" },
    { "name": "اسم البديل المستورد", "type": "مستورد" },
    { "name": "بديل أرخص", "type": "أرخص" },
    { "name": "بديل بنفس المادة الفعالة", "type": "نفس المادة" }
  ]
}`,
          },
        ],
      },
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in identify-drug:", error);
    res.status(500).json({
      error: "فشل التعرف على صورة الدواء بواسطة الذكاء الاصطناعي",
      details: error?.message,
    });
  }
});

// 4. Drug Interaction Checker API
app.post("/api/ai/check-interactions", async (req, res) => {
  try {
    const { drugNames, patientConditions } = req.body;
    if (!drugNames || !Array.isArray(drugNames) || drugNames.length === 0) {
      return res.status(400).json({ error: "يرجى تحديد الأدوية لفحص التفاعلات الدوائية." });
    }

    const ai = getGeminiClient();
    const prompt = `أنت استشاري علم الأدوية والتفاعلات الدوائية في نظام PharmaCare AI.
قم بفحص التداخلات والتفاعلات الدوائية بين قائمة الأدوية التالية:
الأدوية المختارة: ${drugNames.join(" ، ")}
حالة المريض والأمراض المزمنة: ${patientConditions ? patientConditions.join(" ، ") : "لا يوجد"}

قم بإرجاع تقرير تفاعلات مفصل بصيغة JSON باللغة العربية:
{
  "riskLevel": "safe | minor | moderate | severe",
  "riskScorePercentage": 75,
  "summary": "ملخص شامل لنتائج الفحص والخطورة العامة",
  "interactions": [
    {
      "drug1": "اسم الدواء الأول",
      "drug2": "اسم الدواء الثاني",
      "severity": "طفيفة | متوسطة | خطيرة جداً",
      "mechanism": "طريقة وتأثير التداخل الكيميائي/الفيزيولوجي",
      "precaution": "الاحتياطات والتوصيات للوقاية من التداخل"
    }
  ],
  "alternativesSuggested": ["أدوية بديلة أكثر أماناً لمنع التداخل"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in check-interactions:", error);
    res.status(500).json({
      error: "حدث خطأ أثناء فحص التفاعلات الدوائية بالذكاء الاصطناعي",
      details: error?.message,
    });
  }
});

// 5. Smart Dosage Calculator API
app.post("/api/ai/calculate-dosage", async (req, res) => {
  try {
    const { medicineName, age, weightKg, gender, isPregnant, kidneyImpairment, liverImpairment, allergies, condition } = req.body;
    if (!medicineName || !age) {
      return res.status(400).json({ error: "اسم الدواء والعمر مطلوبان لحساب الجرعة الدقيقة." });
    }

    const ai = getGeminiClient();
    const prompt = `أنت خبير حاسبة الجرعات الصيدلانية السريرية.
قم بحساب الجرعة الدقيقة والآمنة للدواء بناءً على المعطيات التالية:
- الدواء: ${medicineName}
- العمر: ${age} سنة
- الوزن: ${weightKg || "غير محدد"} كجم
- الجنس: ${gender || "غير محدد"}
- حالة الحمل: ${isPregnant ? "حامل" : "غير حامل"}
- قصور وظائف الكلى: ${kidneyImpairment ? "نعم (تعديل الجرعة مطلوب)" : "لا"}
- قصور وظائف الكبد: ${liverImpairment ? "نعم" : "لا"}
- الحساسية المعروفة: ${allergies ? allergies.join(", ") : "لا يوجد"}
- الحالة المرضية المستهدفة: ${condition || "غير محددة"}

قم بإرجاع النتيجة بصيغة JSON باللغة العربية:
{
  "medicineName": "${medicineName}",
  "calculatedDosage": "الجرعة الموصى بها بالدقة (مثلاً 250mg كل 8 ساعات)",
  "dailyFrequency": "التكرار اليومي",
  "maxDailyLimit": "الحد الأقصى للجرعة اليومية الآمنة",
  "patientCategory": "تصنيف فئة المريض (أطفال/بالغين/كبار السن/حمل)",
  "specialWarnings": ["تحذير بخصوص الكلى/الكبد/الحمل إن وجد"],
  "reasoning": "الشرح السريري لسبب التوصية بهذه الجرعة"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in calculate-dosage:", error);
    res.status(500).json({
      error: "فشل حساب الجرعة الدوائية بواسطة الذكاء الاصطناعي",
      details: error?.message,
    });
  }
});

// 6. Lab Results Analyzer API
app.post("/api/ai/analyze-lab", async (req, res) => {
  try {
    const { imageBase64, textDescription } = req.body;
    if (!imageBase64 && !textDescription) {
      return res.status(400).json({ error: "صورة نتيجة المختبر أو نص التحليل مطلوب." });
    }

    const ai = getGeminiClient();
    let contentsPayload: any;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contentsPayload = {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: "تحليل نتيجة ورقة الفحص المخبري الطبي واستخراج المؤشرات غير الطبيعية والشرح الطبي بالعربية بصيغة JSON." },
        ],
      };
    } else {
      contentsPayload = `تحليل نتائج المختبر التالية بالعربية: ${textDescription}`;
    }

    const promptInstructions = `أعد النتيجة بصيغة JSON بالعربية بالشكل:
{
  "testType": "نوع الفحص المخبري (مثلاً: صورة دم كاملة CBC، وظائف كلى، وظائف كبد، سكر تراكمي)",
  "summary": "ملخص النتائج العامة",
  "abnormalParameters": [
    {
      "parameter": "اسم التحليل (مثلاً WBC, Creatinine)",
      "value": "القيمة المكتوبة في التحليل",
      "referenceRange": "المعدل الطبيعي",
      "status": "مرتفع | منخفض | طبيعي",
      "meaning": "معنى النتيجة الشاذة ودلالتها الطبية"
    }
  ],
  "clinicalSignificance": "الأهمية السريرية وما قد تشير إليه النتائج",
  "suggestedFollowUp": "التوصيات بالخطوات القادمة أو الفحوصات التكميلية",
  "disclaimer": "ملاحظة: هذا التفسير مبدئي بالذكاء الاصطناعي ويجب مراجعته مع الطبيب المعالج."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contentsPayload,
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in analyze-lab:", error);
    res.status(500).json({
      error: "فشل تحليل ورقة نتائج المختبر بواسطة الذكاء الاصطناعي",
      details: error?.message,
    });
  }
});

// 7. Radiology Scan Analyzer API
app.post("/api/ai/analyze-radiology", async (req, res) => {
  try {
    const { imageBase64, scanType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "صورة الأشعة الطبية مطلوبة للتحليل." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          {
            text: `أنت مساعد تشخيصي للأشعة الطبية (X-Ray, MRI, CT Scan).
قم بتقديم قراءة وتحليل أولي لصورة الأشعة المرفقة نوع (${scanType || "أشعة تشخيصية"}).
أرجع النتيجة بصيغة JSON باللغة العربية:
{
  "scanType": "${scanType || "أشعة سينية X-Ray"}",
  "bodyPart": "العضو أو المنطقة الظاهرة بالأشعة (مثلاً: الصدر، العظام، الجمجمة)",
  "preliminaryFindings": ["ملاحظة أولية 1", "ملاحظة أولية 2"],
  "detailedAnalysis": "تحليل وتوصيف الحالة الظاهرة في الأشعة بشكل علمي مبسط",
  "urgency": "عادي | متابعة | عاجل جداً",
  "disclaimer": "تنبيه هائم جداً: هذه قراءة مساعدة أولية بالذكاء الاصطناعي، والتشخيص النهائي المعتمد يرجع حصراً لأخصائي الأشعة والطبيب المعالج."
}`,
          },
        ],
      },
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error in analyze-radiology:", error);
    res.status(500).json({
      error: "فشل تقديم القراءة الأولية للأشعة الطبية بواسطة الذكاء الاصطناعي",
      details: error?.message,
    });
  }
});

// 8. Smart AI Pharmacist Assistant Chatbot API
app.post("/api/ai/smart-chat", async (req, res) => {
  try {
    const { messages, currentRole } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "المحادثة غير صالحة." });
    }

    const ai = getGeminiClient();

    const formattedHistory = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const systemInstruction = `أنت "مساعد PharmaCare AI الذكي"، صيدلي خبير ومستشار طبي ناصح ومتخصص.
دور المستخدم الحالي: ${currentRole || "مستخدم"}.
استجب دائماً باللغة العربية بأسلوب راقٍ، دقيق، موثوق، علمي، ومنظم.
قدم إجابات واضحة حول استخدام الأدوية، التداخلات الدوائية، البدائل، والجرعات.
دائماً أذكر تنبيهاً لطيفاً في نهاية الاستشارات المعقدة أن النظام هو مساعد ذكي ولا يغني عن مراجعة الطبيب.`;

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction,
      },
    });

    // Send the last message
    const lastUserMsg = messages[messages.length - 1]?.text || "مرحباً";
    const response = await chat.sendMessage({ message: lastUserMsg });

    res.json({
      reply: response.text,
    });
  } catch (error: any) {
    console.error("Error in smart-chat:", error);
    res.status(500).json({
      error: "حدث خطأ في المساعد الذكي",
      details: error?.message,
    });
  }
});

// ===============================================================================
// VITE & SERVING CONFIGURATION
// ===============================================================================
async function startServer() {
  // API Health Route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "PharmaCare AI", timestamp: new Date() });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PharmaCare AI Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
