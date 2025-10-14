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
  { title: "الخطة الاسبوعية", type: "external", url: "https://tinyurl.com/7b5nu45j" },
  { title: "تقرير طالب", type: "page", path: "/report.html" },
  { title: "السياسات", type: "submenu", role: "student" }
];

const staffMenu = [
  { title: "جداول الحلقة الثانية", type: "pdf", filename: "cycle2.pdf" },
  { title: "جداول الحلقة الثالثة", type: "pdf", filename: "cycle3.pdf" },
  { title: "جداول المعلمين", type: "pdf", filename: "teachers.pdf" },
  { title: "جداول المناوبة", type: "pdf", filename: "duties.pdf" },
  { title: "التوقيت الزمني للحصص", type: "pdf", filename: "timings.pdf" },
  { title: "الخطة الاسبوعية", type: "external", url: "https://tinyurl.com/7b5nu45j" },
  { title: "السياسات", type: "submenu", role: "staff" }
];

// ===================== MENU API =====================
app.get("/api/menu/:role/:section", (req, res) => {
  const { role, section } = req.params;

  let menu;
  if (role === "student") menu = JSON.parse(JSON.stringify(studentMenu));
  else if (role === "staff") menu = JSON.parse(JSON.stringify(staffMenu));
  else return res.status(400).send("❌ دور غير معروف");

  // تعديل ملفات PDF حسب القسم (male/female)
  if (section === "male" || section === "female") {
    menu.forEach(item => {
      if (item.type === "pdf" && ["cycle2.pdf","cycle3.pdf","timings.pdf","teachers.pdf","duties.pdf"].includes(item.filename)) {
        const parts = item.filename.split("."); // اسم + امتداد
        item.filename = parts[0] + "g." + parts[1]; // إضافة g قبل الامتداد
      }
    });
  }

  res.json(menu);
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
