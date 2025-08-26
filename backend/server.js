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
  if (role === "staff") ret
