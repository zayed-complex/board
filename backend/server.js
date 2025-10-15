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

// ===================== USERS =====================
const STAFF_USERS = [
  { username: "admin", password: "1234" },
  { username: "Admin", password: "1234" },
  { username: "staff", password: "abcd" }
];

// ===================== MENUS =====================

// 🎓 قائمة الطلاب / أولياء الأمور
const studentMenu = [
  { title: "📘 جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "📗 جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "⏰ التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "🗓️ الخطة الأسبوعية", type: "external", url: "https://tinyurl.com/7b5nu45j" },
  { title: "📞 أرقام التواصل", type: "pdf", filename: "numbers.pdf" },
  { title: "📄 تقرير طالب", type: "page", path: "/report.html" },
  { title: "📑 السياسات", type: "submenu", role: "student" },
  { title: "💻 منصة ألف", type: "external", url: "https://www.alefed.com" },
  { title: "🏛️ وزارة التربية والتعليم", type: "external", url: "https://moe.gov.ae/ar/Pages/home.aspx" },
  { title: "🎓 بوابة التعلم الذكي", type: "external", url: "https://lms.moe.gov.ae/" }
];

// 👨‍🏫 قائمة الكادر الإداري والتدريسي
const staffMenu = [
  { title: "📘 جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "📗 جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "👩‍🏫 جداول المعلمين", type: "pdf", filename: "teachers.pdf" },
  { title: "🧑‍💼 جداول المناوبة", type: "pdf", filename: "duties.pdf" },
  { title: "⏰ التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "🗓️ الخطة الأسبوعية", type: "external", url: "https://tinyurl.com/7b5nu45j" },
  { title: "📞 أرقام التواصل", type: "pdf", filename: "numbers.pdf" },
  { title: "📑 السياسات", type: "submenu", role: "staff" },
  { title: "🏫 الشؤون الأكاديمية", type: "external", url: "https://tinyurl.com/2de67jvn" },
  { title: "💻 منصة ألف", type: "external", url: "https://www.alefed.com" },
  { title: "🔗 روابط مهمة", type: "external", url: "https://sso.ese.gov.ae/" },
  { title: "📚 منهاجي", type: "external", url: "https://minhaji.moe.gov.ae/library" },
  { title: "🕘 الغياب والحضور اليومي", type: "external", url: "https://emiratesschoolsese-my.sharepoint.com/" }
];

// ===================== API: MENU (WITH SECTION) =====================
app.get("/api/menu/:role/:section", (req, res) => {
  const { role, section } = req.params;

  // ✳️ نستخدم section لتخصيص القوائم في المستقبل (حاليًا لا تغيير)
  console.log(`📋 Loading menu for role=${role}, section=${section}`);

  if (role === "student") return res.json(studentMenu);
  if (role === "staff") return res.json(staffMenu);

  return res.status(400).json({ error: "❌ دور غير معروف" });
});

// ===================== LOGIN =====================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = STAFF_USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (user) return res.json({ success: true });
  return res.json({ success: false, message: "اسم المستخدم أو كلمة المرور خاطئة" });
});

// ===================== SUBJECT NAMES =====================
const subject_names = [
  "اللغة العربية",
  "اللغة الإنجليزية",
  "التربية الإسلامية",
  "الرياضيات",
  "العلوم",
  "الدراسات الاجتماعية",
  "التصميم والتكنولوجيا",
  "الأحياء",
  "الفيزياء",
  "الكيمياء"
];

// ===================== LOAD STUDENTS FUNCTION =====================
function loadStudentsFromExcel() {
  const EXCEL_PATH = path.join(__dirname, "data", "students.xlsx");

  if (!fs.existsSync(EXCEL_PATH)) {
    console.warn("⚠️ ملف Excel غير موجود:", EXCEL_PATH);
    return {};
  }

  const workbook = xlsx.readFile(EXCEL_PATH, { cellText: false, cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "-" });

  const students = {};
  const dataRows = rows.slice(1);

  dataRows.forEach((row) => {
    let studentId = row[0];
    if (!studentId || studentId === "-") return;
    studentId = String(studentId).replace(/[^\d]/g, "").trim();
    if (!studentId) return;

    const name = row[1] ? String(row[1]).trim() : "-";
    const className = row[3] ? String(row[3]).trim() : "-";

    const subjects = subject_names.map((sub, i) => {
      const base = 4 + i * 5; // من العمود الرابع تبدأ المواد
      return {
        name: sub,
        formative: row[base] || "-",
        participation: row[base + 1] || "-",
        task: row[base + 2] || "-",
        commitment: row[base + 3] || "-",
        note: row[base + 4] || ""
      };
    });

    students[studentId] = {
      student: { "الاسم": name, "الشعبة": className },
      subjects
    };
  });

  return students;
}

// ===================== LOAD DATA ON START =====================
let studentReports = loadStudentsFromExcel();

// ===================== API: GET REPORT =====================
app.get("/api/report/:id", (req, res) => {
  const id = String(req.params.id).trim();

  const student = studentReports[id];
  if (!student) {
    return res.status(404).json({ error: "❌ الطالب غير موجود" });
  }

  res.json(student);
});

// ===================== START SERVER =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
