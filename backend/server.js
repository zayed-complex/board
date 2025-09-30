// backend/server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "../public"), { etag: false, maxAge: 0 }));

// ===================== STAFF USERS =====================
const STAFF_USERS = [
  { username: "admin", password: "1234" },
  { username: "staff", password: "abcd" }
];

// ===================== MENUS =====================
const studentMenu = [
  { title: "الإعلانات", page: "announcements.html" },
  { title: "الأنشطة الطلابية", page: "activities.html" },
  { title: "السياسات", page: "policies.html?role=student" }
];

const staffMenu = [
  { title: "الإعلانات", page: "announcements.html" },
  { title: "الأنشطة", page: "activities.html" },
  { title: "السياسات", page: "policies.html?role=staff" }
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
  { title: "سياسة التعاقد الوظيفي", filename: "employment_contract_policy.pdf" },
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
    const studentId = String(row[0]).trim(); // العمود الأول: رقم الهوية
    if (!studentId || studentId === "-") return;

    const name = row[1] ? String(row[1]).trim() : "-";       // العمود الثاني: الاسم
    const className = row[2] ? String(row[2]).trim() : "-";  // العمود الثالث: الشعبة

    const subjects = subject_names.map((sub, i) => {
      const base = 3 + i*5; // بعد الأعمدة الأساسية الثلاثة
      return {
        name: sub,
        formative: row[base] || "-",
        participation: row[base+1] || "-",
        task: row[base+2] || "-",
        commitment: row[base+3] || "-",
        note: row[base+4] || ""
      };
    });

    students[studentId] = {
      student: { "الاسم": name, "الشعبة": className },
      subjects
    };
  });

  return students;
}

let studentReports = loadStudentsFromExcel();
console.log(`✅ Loaded ${Object.keys(studentReports).length} student reports.`);

app.post("/api/reload-students", (req, res) => {
  studentReports = loadStudentsFromExcel();
  return res.json({ ok: true, count: Object.keys(studentReports).length });
});

// ===================== SINGLE STUDENT REPORT =====================
app.get("/api/report/:id", (req, res) => {
  const id = String(req.params.id).trim();
  const report = studentReports[id];
  if (!report) return res.status(404).send("❌ الطالب غير موجود");
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
