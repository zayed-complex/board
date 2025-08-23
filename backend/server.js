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
// ✅ Menus
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
  { title: "بوابة التعلم الذكي", type: "external", url: "https://lms.ese.gov.ae" }
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

// APIs
app.get("/api/menu/student", (req, res) => res.json({ menu: studentMenu }));
app.get("/api/menu/staff", (req, res) => res.json({ menu: staffMenu }));

// ============================
// 📂 Upload PDFs
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API & Web on http://localhost:${PORT}`));
