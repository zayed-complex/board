const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

// ✅ قوائم الطلاب
const studentMenu = [
  { title: "عرض جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "عرض جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "التقارير الطلابية", type: "page", path: "/report.html" },
  { title: "السياسات", type: "submenu", role: "student" }
];

// ✅ قوائم الموظفين
const staffMenu = [
  { title: "جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "جداول المعلمين", type: "pdf", filename: "teachers.pdf" },
  { title: "جداول المناوبة", type: "pdf", filename: "duties.pdf" },
  { title: "التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "السياسات", type: "submenu", role: "staff" }
];

// ✅ API للقوائم (يرجع مصفوفة مباشرة)
app.get("/api/menu/:role", (req, res) => {
  const { role } = req.params;
  if (role === "student") return res.json(studentMenu);
  if (role === "staff") return res.json(staffMenu);
  res.status(400).send("دور غير معروف");
});

// ✅ السياسات للطلاب
const studentPolicies = [
  { title: "اللائحة السلوكية", filename: "behavior_policy.pdf" },
  { title: "سياسة التقييم", filename: "assessment_policy.pdf" },
  { title: "سياسة الحضور والانصراف", filename: "attendance_policy.pdf" },
  { title: "سياسة حقوق الطفل", filename: "child_rights_policy.pdf" }
];

// ✅ السياسات للموظفين
const staffPolicies = [
  { title: "سياسة التعاقد الوظيفي", filename: "employment_contract_policy.pdf" },
  { title: "الميثاق المهني والأخلاقي", filename: "ethics_charter_policy.pdf" },
  { title: "سياسة المغادرة", filename: "leave_policy.pdf" },
  { title: "سياسة الأمن الرقمي", filename: "digital_safety_policy.pdf" }
];

// ✅ API للسياسات
app.get("/api/policies/:role", (req, res) => {
  const { role } = req.params;
  if (role === "student") return res.json(studentPolicies);
  if (role === "staff") return res.json(staffPolicies);
  res.status(400).send("دور غير معروف");
});

// ✅ حماية ملفات PDF
app.get("/api/pdfs/:filename", (req, res) => {
  const safe = /^[a-zA-Z0-9_.-]+\.pdf$/;
  const { filename } = req.params;
  if (!safe.test(filename)) return res.status(400).send("اسم ملف غير صالح");
  const filePath = path.join(__dirname, "pdfs", filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("الملف غير موجود");
  res.sendFile(filePath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Running at http://localhost:${PORT}`));
