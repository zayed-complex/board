// backend/server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// ==================================================
// 1) ملفات ثابتة (HTML, CSS, JS, PDF)
// ==================================================
app.use(express.static(path.join(__dirname, "../public"))); // public تحتوي على pdfs

// ==================================================
// 2) مستخدمو الموظفين
// ==================================================
const STAFF_USERS = [
  { username: "admin", password: "1234" },
  { username: "staff", password: "abcd" }
];

// ==================================================
// 3) قوائم الطلاب والموظفين
// ==================================================
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
  res.status(400).send("❌ دور غير معروف");
});

// ==================================================
// 4) السياسات
// ==================================================
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
  res.status(400).send("❌ دور غير معروف");
});

// ==================================================
// 5) API لتقديم ملفات PDF
// ==================================================
app.get("/api/pdfs/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../public/pdfs", req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send("❌ الملف غير موجود");
  });
});

// ==================================================
// 6) إعداد Excel و تحميل بيانات الطلاب
// ==================================================
const EXCEL_PATH = path.join(__dirname, "data", "students.xlsx");

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

function loadStudentsFromExcel() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.warn("⚠️ ملف Excel غير موجود:", EXCEL_PATH);
    return {};
  }

  const workbook = xlsx.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "-" });

  const students = {};

  rows.forEach((row) => {
    const possibleIdKeys = ["ID","Id","id","الهوية","رقم الهوية","NationalID"];
    let id = possibleIdKeys.map(k => row[k]).find(v => v && String(v).trim() !== "");
    if (!id) return;
    id = String(id).trim();

    const possibleNameKeys = ["الاسم","اسم","Name","student_name"];
    let name = possibleNameKeys.map(k => row[k]).find(v => v && String(v).trim() !== "") || "-";

    const possibleClassKeys = ["الشعبة","Class","الفصل"];
    let className = possibleClassKeys.map(k => row[k]).find(v => v && String(v).trim() !== "") || "-";

    const allCols = Object.keys(row);
    const dataCols = allCols.slice(4);

    const subjects = subject_names.map((sub, i) => {
      const base = i*6;
      return {
        name: sub,
        formative: row[dataCols[base]] || "-",
        academic: row[dataCols[base+1]] || "-",
        participation: row[dataCols[base+2]] || "-",
        alef: row[dataCols[base+3]] || "-",
        behavior: row[dataCols[base+4]] || "-",
        commitment: row[dataCols[base+5]] || "-"
      };
    });

    students[id] = {
      student: { "الاسم": String(name).trim(), "الشعبة": String(className).trim() },
      subjects
    };
  });

  return students;
}

let studentReports = loadStudentsFromExcel();
console.log(`✅ Loaded ${Object.keys(studentReports).length} student reports.`);

app.post("/api/reload-students", (req, res) => {
  studentReports = loadStudentsFromExcel();
  res.json({ ok: true, count: Object.keys(studentReports).length });
});

// ==================================================
// 7) API لتقرير طالب واحد
// ==================================================
app.get("/api/report/:id", (req, res) => {
  const id = String(req.params.id).trim();
  const report = studentReports[id];
  if (!report) return res.status(404).send("❌ الطالب غير موجود");
  res.json(report);
});

// ==================================================
// 8) تسجيل الدخول
// ==================================================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = STAFF_USERS.find(u => u.username===username && u.password===password);
  if (user) res.json({ success: true });
  else res.json({ success: false, message: "اسم المستخدم أو كلمة المرور خاطئة" });
});

// ==================================================
// 9) تشغيل السيرفر
// ==================================================
app.listen(PORT, () => {
  console.log(`🚀 Server works on: http://localhost:${PORT}`);
});
