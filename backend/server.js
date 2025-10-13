// backend/server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Serve static files
app.use(express.static(path.join(__dirname, "../public"), { etag: false, maxAge: 0 }));

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
  { title: "تقرير طالبة", type: "page", path: "/report.html" },
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

app.get("/api/menu/:role", (req, res) => {
  const { role } = req.params;
  if (role === "student") return res.json(studentMenu);
  if (role === "staff") return res.json(staffMenu);
  return res.status(400).send("❌ دور غير معروف");
});

// ===================== POLICIES =====================
const studentPolicies = [
  { title: "اللائحة السلوكية", filename: "behavior_policy.pdf" },
  { title: "سياسة التقييم", filename: "assessment_policy.pdf" },
  { title: "سياسة المغادرة", filename: "leave_policy.pdf" },
  { title: "سياسة الأمن الرقمي", filename: "digital_safety_policy.pdf" },
  { title: "سياسة حقوق الطفل", filename: "child_rights_policy.pdf" },
  { title: "سياسة الحضور والغياب", filename: "attendance_policy.pdf" }
];

const staffPolicies = [
  { title: "اللائحة السلوكية", filename: "behavior_policy.pdf" },
  { title: "سياسة التقييم", filename: "assessment_policy.pdf" },
  { title: "سياسة المغادرة", filename: "leave_policy.pdf" },
  { title: "سياسة الأمن الرقمي", filename: "digital_safety_policy.pdf" },
  { title: "سياسة حقوق الطفل", filename: "child_rights_policy.pdf" },
  { title: "سياسة الحضور والانصراف", filename: "attendance_policy.pdf" },
  { title: "إطار معايير الرقابة والتقييم المدرسية", filename: "framework.pdf" },
  { title: "السياسات المهنية والأخلاقية", filename: "ethics_charter_policy.pdf" }
];

app.get("/api/policies/:role", (req, res) => {
  const { role } = req.params;
  if (role === "student") return res.json(studentPolicies);
  if (role === "staff") return res.json(staffPolicies);
  return res.status(400).send("❌ دور غير معروف");
});

// ===================== PDF FILES =====================
app.get("/api/pdfs/:filename", (req, res) => {
  const safeFile = /^[\w.-]+\.pdf$/;
  const { filename } = req.params;
  if (!safeFile.test(filename)) return res.status(400).send("❌ اسم ملف غير صالح");

  const filePath = path.join(__dirname, "../public/pdfs", filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("❌ الملف غير موجود");

  res.setHeader("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

app.get("/api/pdfs/download/:filename", (req, res) => {
  const safeFile = /^[\w.-]+\.pdf$/;
  const { filename } = req.params;
  if (!safeFile.test(filename)) return res.status(400).send("❌ اسم ملف غير صالح");

  const filePath = path.join(__dirname, "../public/pdfs", filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("❌ الملف غير موجود");

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("❌ Error downloading PDF:", err);
      if (!res.headersSent) res.status(500).send("❌ حدث خطأ أثناء تنزيل الملف");
    }
  });
});

// ===================== EXCEL STUDENT REPORTS =====================
const EXCEL_PATH = path.join(__dirname, "data", "students.xlsx");
const subject_names = [
  "اللغة العربية","اللغة الإنجليزية","التربية الإسلامية","الرياضيات",
  "العلوم","الدراسات الاجتماعية","التصميم والتكنولوجيا",
  "الأحياء","الفيزياء","الكيمياء"
];

function loadStudentsFromExcel() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.warn("⚠️ ملف Excel غير موجود:", EXCEL_PATH);
    return {};
  }

  const workbook = xlsx.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "-" });

  const students = {};
  const dataRows = rows.slice(1); // تجاهل صف العناوين

  dataRows.forEach((row) => {
    let studentId = row[0];
    if (!studentId || studentId === "-") return;

    studentId = String(studentId).replace(/\s/g, "").trim(); // تنظيف رقم الهوية
    if (!studentId) return;

    const name = row[1] ? String(row[1]).trim() : "-";       // العمود الثاني: الاسم
    const className = row[3] ? String(row[3]).trim() : "-";  // العمود الرابع: الشعبة ✅

    const subjects = subject_names.map((sub, i) => {
      const base = 4 + i * 5; // من العمود الخامس تبدأ المواد
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

  console.log(`✅ Loaded ${Object.keys(students).length} student reports.`);
  return students;
}

let studentReports = loadStudentsFromExcel();

app.post("/api/reload-students", (req, res) => {
  studentReports = loadStudentsFromExcel();
  return res.json({ ok: true, count: Object.keys(studentReports).length });
});

// ===================== SINGLE STUDENT REPORT =====================
app.get("/api/report/:id", (req, res) => {
  const id = String(req.params.id).replace(/\s/g, "").trim();
  const report = studentReports[id];
  if (!report) {
    console.warn(`⚠️ رقم الهوية ${id} غير موجود`);
    return res.status(404).send("❌ الطالب غير موجود");
  }
  return res.json(report);
});

// ===================== LOGIN =====================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = STAFF_USERS.find(u => u.username === username && u.password === password);
  if (user) return res.json({ success: true });
  return res.json({ success: false, message: "اسم المستخدم أو كلمة المرور خاطئة" });
});

// ===================== START SERVER =====================
app.listen(PORT, () => {
  console.log(`🚀 Server works on: http://localhost:${PORT}`);
});
