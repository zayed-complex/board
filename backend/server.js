// backend/server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const xlsx = require("xlsx");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// ✅ Splash Page
// ============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/splash.html"));
});

// ============================
// ✅ Static files
// ============================
app.use(express.static(path.join(__dirname, "../public")));
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

// ============================
// ✅ Student and Staff menus
// ============================
const studentMenu = [
  { title: "عرض جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "عرض جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "عرض التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "🎓 التقارير الدوريّة الطلابية", type: "page", path: "/report.html" },
  { title: "أرقام تواصل الهيئة الادارية والتعليمية", type: "pdf", filename: "numbers.pdf" },
  { title: "عرض الخطة الأسبوعية", type: "pdf", filename: "weekly_plan.pdf" },
  {
    title: "السياسات",
    type: "submenu",
    items: [
      { title: "اللائحة السلوكية", type: "pdf", filename: "behavior_policy.pdf" },
      { title: "سياسة التقييم", type: "pdf", filename: "assessment_policy.pdf" },
      { title: "سياسة المغادرة", type: "pdf", filename: "leave_policy.pdf" },
      { title: "سياسة الأمن الرقمي", type: "pdf", filename: "digital_safety_policy.pdf" },
      { title: "سياسة حقوق الطفل", type: "pdf", filename: "child_rights_policy.pdf" },
      { title: "سياسة الحضور والانصراف", type: "pdf", filename: "attendance_policy.pdf" }
    ]
  },
  { title: "منصة ألف", type: "external", url: "https://www.alefed.com" },
  { title: "وزارة التربية والتعليم", type: "external", url: "https://moe.gov.ae/ar/Pages/home.aspx" },
  { title: "بوابة التعلم الذكي", type: "external", url: "https://lms.ese.gov.ae/" }
];

const staffMenu = [
  { title: "عرض جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "عرض جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "عرض جداول المعلمين", type: "pdf", filename: "teachers.pdf" },
  { title: "عرض جداول المناوبة الأسبوعية", type: "pdf", filename: "duties.pdf" },
  { title: "عرض التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "أرقام تواصل الهيئة الادارية والتعليمية", type: "pdf", filename: "numbers.pdf" },
  { title: "عرض الخطة الأسبوعية", type: "pdf", filename: "weekly_plan.pdf" },
  {
    title: "السياسات",
    type: "submenu",
    items: [
      { title: "اللائحة السلوكية", type: "pdf", filename: "behavior_policy.pdf" },
      { title: "سياسة التقييم", type: "pdf", filename: "assessment_policy.pdf" },
      { title: "سياسة المغادرة", type: "pdf", filename: "leave_policy.pdf" },
      { title: "سياسة الأمن الرقمي", type: "pdf", filename: "digital_safety_policy.pdf" },
      { title: "سياسة حقوق الطفل", type: "pdf", filename: "child_rights_policy.pdf" },
      { title: "سياسة الحضور والانصراف", type: "pdf", filename: "attendance_policy.pdf" },
      { title: "سياسة التعاقد الوظيفي", type: "pdf", filename: "employment_contract_policy.pdf" },
      { title: "سياسة الميثاق المهني والأخلاقي", type: "pdf", filename: "ethics_charter_policy.pdf" }
    ]
  },
  { title: "منصة ألف", type: "external", url: "https://www.alefed.com" },
  { title: "الغياب والحضور اليومي", type: "external", url: "https://emiratesschoolsese-my.sharepoint.com/:x:/g/..." },
  { title: "رحلتي", type: "external", url: "https://idh.ese.gov.ae/" },
  { title: "المنهل", type: "external", url: "https://sis.ese.gov.ae/" },
  { title: "بوابة التعلم الذكي", type: "external", url: "https://lms.ese.gov.ae/" }
];

// ============================
// ✅ APIs
// ============================

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "teacher" && password === "12345") {
    return res.json({ success: true, message: "تم تسجيل الدخول" });
  }
  return res.status(401).json({ success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
});

// Menus
app.get("/api/menu/student", (req, res) => res.json({ menu: studentMenu }));
app.get("/api/menu/staff", (req, res) => res.json({ menu: staffMenu }));

// Student report from Excel
app.get("/api/report/:studentId", (req, res) => {
  try {
    const wb = xlsx.readFile(path.join(__dirname, "data", "students.xlsx"));
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(ws, { defval: "-" });

    const inputId = String(req.params.studentId).trim();
    const student = rows.find(r => String(r["رقم الهوية"]).trim() === inputId);

    if (!student) return res.status(404).json({ error: "رقم الهوية غير صحيح أو غير موجود في البيانات" });

    const subjectNames = [
      "اللغة العربية","اللغة الإنجليزية - English","التربية الإسلامية","الرياضيات - Math",
      "العلوم - Science","الدراسات الاجتماعية","التصميم والتكنولوجيا - DT",
      "الأحياء - Biology","الفيزياء - Physics","الكيمياء - Chemistry"
    ];

    const subjects = [];
    for (let i = 1; i <= subjectNames.length; i++) {
      if (student.hasOwnProperty(`Subject${i}_Formative`)) {
        subjects.push({
          name: subjectNames[i - 1],
          formative: student[`Subject${i}_Formative`] ?? "-",
          academic: student[`Subject${i}_Academic`] ?? "-",
          participation: student[`Subject${i}_Participation`] ?? "-",
          alef: student[`Subject${i}_Alef`] ?? "-",
          behavior: student[`Subject${i}_Behavior`] ?? "-",
          commitment: student[`Subject${i}_Commitment`] ?? "-",
        });
      }
    }

    res.json({ name: student["الاسم"], subjects });
  } catch (e) {
    res.status(500).json({ error: `خطأ في قراءة الملف: ${e.message}` });
  }
});

// Safe PDF serving
app.get("/api/pdfs/:filename", (req, res) => {
  const safe = /^[a-zA-Z0-9_.-]+\.pdf$/;
  const { filename } = req.params;
  if (!safe.test(filename)) return res.status(400).send("اسم ملف غير صالح");
  const filePath = path.join(__dirname, "pdfs", filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("الملف غير موجود");
  res.sendFile(filePath);
});

// ============================
// 📂 File upload (multer)
// ============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "backend/pdfs/"),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.post("/upload", upload.single("pdfFile"), (req, res) => {
  if (!req.file) return res.json({ success: false, message: "لم يتم اختيار أي ملف" });
  res.json({ success: true, message: "تم رفع الملف بنجاح: " + req.file.originalname });
});

// ============================
// ✅ Start server
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API & Web on http://localhost:${PORT}`));
