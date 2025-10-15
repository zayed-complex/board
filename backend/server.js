// ===================== IMPORTS =====================
const express = require("express");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ===================== STAFF USERS =====================
const STAFF_USERS = [
  { username: "admin", password: "1234" },
  { username: "Admin", password: "1234" },
  { username: "staff", password: "abcd" }
];

// ===================== MENUS =====================
const studentMenu = [
  { title: "جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "الخطة الاسبوعية", type: "external", url: "https://tinyurl.com/7b5nu45j"},
  { title: "أرقام التواصل", type: "pdf", filename: "numbers.pdf" },
  { title: "تقرير طالب", type: "page", path: "/report.html" },
  { title: "السياسات", type: "submenu", role: "student" },
  { title: "منصة ألف", type: "external", url: "https://www.alefed.com" },
  { title: "وزارة التربية والتعليم", type: "external", url: "https://moe.gov.ae/ar/Pages/home.aspx" },
  { title: "بوابة التعلم الذكي", type: "external", url: "https://lms.moe.gov.ae/" }
];

const staffMenu = [
  { title: "جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "جداول المعلمين", type: "pdf", filename: "teachers.pdf" },
  { title: "جداول المناوبة", type: "pdf", filename: "duties.pdf" },
  { title: "التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "الخطة الاسبوعية", type: "external", url: "https://tinyurl.com/7b5nu45j"},
  { title: "أرقام التواصل", type: "pdf", filename: "numbers.pdf" },
  { title: "السياسات", type: "submenu", role: "staff" },
  { title: "الشؤون الأكاديمية", type: "external", url: "https://tinyurl.com/2de67jvn"},
  { title: "منصة ألف", type: "external", url: "https://www.alefed.com" },
  { title: "روابط مهمة", type: "external", url: "https://sso.ese.gov.ae/" },
  { title: "منهاجي", type: "external", url: "https://minhaji.moe.gov.ae/library" },
  { title: "الغياب والحضور اليومي", type: "external", url: "https://emiratesschoolsese-my.sharepoint.com/" },
];

app.get("/api/menu/:role/:section?", (req, res) => {
  const { role } = req.params;
  if (role === "student") return res.json(studentMenu);
  if (role === "staff") return res.json(staffMenu);
  return res.status(400).send("❌ دور غير معروف");
});

// ===================== LOGIN =====================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = STAFF_USERS.find(u => u.username === username && u.password === password);
  if (user) return res.json({ success: true });
  return res.json({ success: false, message: "اسم المستخدم أو كلمة المرور خاطئة" });
});

// ===================== STUDENT REPORT API =====================
app.get("/api/report/:id", (req, res) => {
  const { id } = req.params;

  const excelFile = path.join(__dirname, "data", "students.xlsx");
  const subject_names = [
    "اللغة العربية","اللغة الإنجليزية","التربية الإسلامية","الرياضيات",
    "العلوم","الدراسات الاجتماعية","التصميم والتكنولوجيا",
    "الأحياء","الفيزياء","الكيمياء"
  ];

  console.log("🔎 Looking for Excel file at:", excelFile);
  console.log("🔍 الهوية المطلوبة:", id);

  if (!fs.existsSync(excelFile)) {
    return res.status(404).json({ error: "❌ ملف البيانات غير موجود" });
  }

  try {
    const workbook = xlsx.readFile(excelFile);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    console.log("📊 عدد الصفوف:", rows.length);

    const student = rows.find(r => {
      const key = Object.keys(r).find(k => k.trim().includes("الهوية"));
      return key && String(r[key]).trim() === id.trim();
    });

    if (!student) {
      return res.status(404).json({ error: "❌ الطالب غير موجود" });
    }

    // استخراج البيانات بناءً على الأعمدة الثابتة
    const keys = Object.keys(student);
    const rowValues = Object.values(student);

    // الأعمدة الثلاثة الأولى هي (الهوية - الاسم - الشعبة)
    const name = student["الاسم"] || rowValues[1];
    const className = student["الشعبة"] || rowValues[2];

    const subjects = subject_names.map((sub, i) => {
      const base = 3 + i * 5; // نبدأ بعد الأعمدة الأساسية
      return {
        name: sub,
        formative: rowValues[base] || "-",
        participation: rowValues[base + 1] || "-",
        task: rowValues[base + 2] || "-",
        commitment: rowValues[base + 3] || "-",
        note: rowValues[base + 4] || ""
      };
    });

    res.json({
      student: { "الاسم": name, "الشعبة": className },
      subjects
    });

  } catch (err) {
    console.error("❌ خطأ أثناء قراءة ملف Excel:", err);
    res.status(500).json({ error: "❌ حدث خطأ أثناء قراءة الملف" });
  }
});

// ===================== START SERVER =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
