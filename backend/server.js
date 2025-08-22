// backend/server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const xlsx = require("xlsx"); // لقراءة students.xlsx

const app = express();
app.use(cors());
app.use(express.json());

// ✅ السماح بـ CORS لكل الملفات (بما فيها manifest.json)
app.use(cors());

// ✅ خدمة الملفات من مجلد public
app.use(express.static(path.join(__dirname, "../public")));

// ثابت: بيانات القوائم (مطابقة لمحتوى صفحاتك)
const studentMenu = [
  { title: "عرض جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "عرض جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "عرض التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "🎓 التقارير الطلابية", type: "page", path: "/report.html" },
  { title: "أرقام الهيئة الادارية والتعليمية", type: "pdf", filename: "numbers.pdf" },
  { title: "عرض الخطة الأسبوعية", type: "pdf", filename: "weekly_plan.pdf" },
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
  { title: "أرقام الهيئة الادارية والتعليمية", type: "pdf", filename: "numbers.pdf" },
  { title: "عرض الخطة الأسبوعية", type: "pdf", filename: "weekly_plan.pdf" },
  { title: "منصة ألف", type: "external", url: "https://www.alefed.com" },
  { title: "الغياب والحضور اليومي", type: "external", url: "https://emiratesschoolsese-my.sharepoint.com/:x:/g/personal/maryam_alyammahi_ese_gov_ae/ESz3TBoOIINMmb9Fh0aZVy8BGC0HtOYfxZFHfM6NVgFJNA?e=yGGqNz" },
  { title: "رحلتي", type: "external", url: "https://idh.ese.gov.ae/" },
  { title: "المنهل", type: "external", url: "https://sis.ese.gov.ae/" },
  { title: "بوابة التعلم الذكي", type: "external", url: "https://lms.ese.gov.ae/" }
];

// 1) صفحة ترحيب بسيطة للويب (تخدِم الملفات من public)
app.use(express.static(path.join(__dirname, "../public")));

// 2) API: دخول الموظف
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "teacher" && password === "12345") {
    return res.json({ success: true, message: "تم تسجيل الدخول" });
  }
  return res.status(401).json({ success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
});

// 3) API: قائمة الطالب
app.get("/api/menu/student", (req, res) => {
  res.json({ menu: studentMenu });
});

// 4) API: قائمة الموظف
app.get("/api/menu/staff", (req, res) => {
  res.json({ menu: staffMenu });
});

// 🔥 5) API: تقرير طالب من Excel
app.get("/api/report/:studentId", (req, res) => {
  try {
    const wb = xlsx.readFile(path.join(__dirname, "data", "students.xlsx"));
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(ws, { defval: "-" });

    // نحول الاثنين لنصوص
    const inputId = String(req.params.studentId).trim();
    const student = rows.find(r => String(r["رقم الهوية"]).trim() === inputId);

    if (!student) {
      return res.status(404).json({ error: "رقم الهوية غير صحيح أو غير موجود في البيانات" });
    }

    // تجميع المواد
    const subjectNames = [
      "اللغة العربية",
      "اللغة الإنجليزية - English",
      "التربية الإسلامية",
      "الرياضيات - Math",
      "العلوم - Science",
      "الدراسات الاجتماعية",
      "التصميم والتكنولوجيا - DT",
      "الأحياء - Biology",
      "الفيزياء - Physics",
      "الكيمياء - Chemistry"
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

// 6) خدمة ملفات PDF
app.get("/api/pdfs/:filename", (req, res) => {
  const safe = /^[a-zA-Z0-9_.-]+\.pdf$/;
  const { filename } = req.params;
  if (!safe.test(filename)) return res.status(400).send("اسم ملف غير صالح");
  const filePath = path.join(__dirname, "pdfs", filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("الملف غير موجود");
  res.sendFile(filePath);
});

// 7) تحويل الروابط /viewer
app.get("/viewer", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/viewer.html"));
});

// Serve PDFs folder
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API & Web on http://localhost:${PORT}`));

const multer = require("multer");

// إعداد مكان الحفظ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "static/pdfs/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // نفس اسم الملف
  }
});

const upload = multer({ storage });

// راوت رفع الملف
app.post("/upload", upload.single("pdfFile"), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: "لم يتم اختيار أي ملف" });
  }
  res.json({ success: true, message: "تم رفع الملف بنجاح: " + req.file.originalname });
});
