// ===================== IMPORTS =====================
const express = require("express");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ===================== MIDDLEWARE =====================
app.use(cors());
app.use(express.json());

// ✅ تأكد من أن هذا السطر قبل أي route أخرى
// لأن public في المجلد الأعلى من backend
app.use(express.static(path.join(__dirname, "..", "public")));

// ===================== STAFF USERS =====================
const STAFF_USERS = [
  { username: "admin", password: "1234" },
  { username: "Admin", password: "1234" },
  { username: "staff", password: "abcd" },
];

// ===================== MENUS =====================
const studentMenu = [
  { title: "جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "الخطة الاسبوعية", type: "external", url: "https://tinyurl.com/7b5nu45j" },
  { title: "أرقام التواصل", type: "pdf", filename: "numbers.pdf" },
  { title: "تقرير طالب", type: "page", path: "/report.html" },
  { title: "السياسات", type: "submenu", role: "student" },
  { title: "منصة ألف", type: "external", url: "https://www.alefed.com" },
  { title: "وزارة التربية والتعليم", type: "external", url: "https://moe.gov.ae/ar/Pages/home.aspx" },
  { title: "بوابة التعلم الذكي", type: "external", url: "https://lms.moe.gov.ae/" },
];

const staffMenu = [
  { title: "جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "جداول المعلمين", type: "pdf", filename: "teachers.pdf" },
  { title: "جداول المناوبة", type: "pdf", filename: "duties.pdf" },
  { title: "التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "الخطة الاسبوعية", type: "external", url: "https://tinyurl.com/7b5nu45j" },
  { title: "أرقام التواصل", type: "pdf", filename: "numbers.pdf" },
  { title: "السياسات", type: "submenu", role: "staff" },
  { title: "الشؤون الأكاديمية", type: "external", url: "https://tinyurl.com/2de67jvn" },
  { title: "منصة ألف", type: "external", url: "https://www.alefed.com" },
  { title: "روابط مهمة", type: "external", url: "https://sso.ese.gov.ae/" },
  { title: "منهاجي", type: "external", url: "https://minhaji.moe.gov.ae/library" },
  { title: "الغياب والحضور اليومي", type: "external", url: "https://emiratesschoolsese-my.sharepoint.com/" },
];

// ===================== MENU API =====================
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

  const excelFile = path.join(__dirname, "..", "data", "students.xlsx");

  if (!fs.existsSync(excelFile)) {
    return res.status(404).json({ error: "❌ ملف البيانات غير موجود" });
  }

  const workbook = xlsx.readFile(excelFile);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  // 🔍 فقط للتأكد أثناء الاختبار
  // console.log(rows.map(r => r["الهوية"]));

  const student = rows.find(r => String(r["الهوية"]).trim() === String(id).trim());

  if (!student) {
    console.log("🟥 لم يتم العثور على:", id);
    return res.status(404).json({ error: "❌ الطالب غير موجود" });
  }

  // إعداد بيانات المواد
  const subjects = [];
  Object.keys(student).forEach(key => {
    if (key.startsWith("مادة")) {
      subjects.push({
        name: student[key],
        formative: student[`تكويني_${key}`] || "-",
        participation: student[`مشاركة_${key}`] || "-",
        task: student[`مهمة_${key}`] || "-",
        commitment: student[`التزام_${key}`] || "-",
        note: student[`ملاحظة_${key}`] || "-",
      });
    }
  });

  res.json({
    student: {
      "الاسم": student["الاسم"],
      "الشعبة": student["الشعبة"],
    },
    subjects,
  });
});

// ===================== START SERVER =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
