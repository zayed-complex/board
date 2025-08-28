// backend/server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// ==================================================
// 1) الملفات الثابتة (HTML, CSS, JS, PDF)
// ==================================================
app.use(express.static(path.join(__dirname, "../public"))); // public تحتوي على pdfs

const STAFF_USERS = [
  { username: "admin", password: "1234" },
  { username: "staff", password: "abcd" }
];

// ==================================================
// 2) قوائم الطلاب والموظفين
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
// 3) السياسات
// ==================================================
const studentPolicies = [
  { title: "اللائحة السلوكية", filename: "behavior_policy.pdf" },
  { title: "سياسة التقييم", filename: "assessment_policy.pdf" },
  { title: "سياسة المغادرة", filename: "leave_policy.pdf" },
  { title: "سياسة الأمن الرقمي", filename: "digital_safety_policy.pdf" },
  { title: "سياسة حقوق الطفل", filename: "child_rights_policy.pdf" },
  { title: "سياسة الحضور والانصراف", filename: "attendance_policy.pdf" }
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
// 4) تسجيل الدخول
// ==================================================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = STAFF_USERS.find(u => u.username === username && u.password === password);
  if (user) res.json({ success: true });
  else res.json({ success: false, message: "اسم المستخدم أو كلمة المرور خاطئة" });
});

// ==================================================
// 5) تشغيل السيرفر
// ==================================================
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`);
});
