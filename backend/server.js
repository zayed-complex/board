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

// ✅ تصحيح المسار إلى مجلد public
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

// ✅ إضافة section إلى مسار القائمة
app.get("/api/menu/:role/:section", (req, res) => {
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

  // المسار الصحيح للملف
  const excelFile = path.join(__dirname, "data", "students.xlsx");
  console.log("🔎 Looking for Excel file at:", excelFile);
  console.log("🔍 الهوية المطلوبة:", id);

  if (!fs.existsSync(excelFile)) {
    return res.status(404).json({ error: "❌ ملف البيانات غير موجود" });
  }

  try {
    // قراءة الملف وتحويله إلى JSON
    const workbook = xlsx.readFile(excelFile);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    console.log("📊 عدد الصفوف:", rows.length);

    // البحث عن الطالب حسب الهوية
    const student = rows.find(r => String(r["الهوية"]).trim() === id.trim());
    if (!student) {
      return res.status(404).json({ error: "❌ الطالب غير موجود" });
    }

    // ✅ أسماء المواد ثابتة
    const subject_names = [
      "اللغة العربية", "اللغة الإنجليزية", "التربية الإسلامية", "الرياضيات",
      "العلوم", "الدراسات الاجتماعية", "التصميم والتكنولوجيا",
      "الأحياء", "الفيزياء", "الكيمياء"
    ];

    // ✅ إنشاء قائمة المواد من الأعمدة (كل مادة لها 5 أعمدة تقييم)
    const subjects = [];
    let startIndex = Object.keys(student).indexOf("الاختبارات التكوينية");

    if (startIndex === -1) {
      // fallback للبحث عن أي عمود مشابه
      startIndex = Object.keys(student).findIndex(k => k.includes("الاختبارات التكوينية"));
    }

    if (startIndex === -1) {
      return res.status(400).json({ error: "❌ لم يتم العثور على أعمدة المواد في الملف" });
    }

    // الآن نقرأ 5 أعمدة لكل مادة
    for (let i = 0; i < subject_names.length; i++) {
      const baseIndex = startIndex + (i * 5);
      const keys = Object.keys(student);

      subjects.push({
        name: subject_names[i],
        formative: student[keys[baseIndex]] || "-",
        participation: student[keys[baseIndex + 1]] || "-",
        task: student[keys[baseIndex + 2]] || "-",
        commitment: student[keys[baseIndex + 3]] || "-",
        note: student[keys[baseIndex + 4]] || "-"
      });
    }

    // ✅ إرسال النتيجة
    res.json({
      student: {
        "الاسم": student["الاسم"],
        "الشعبة": student["الشعبة"]
      },
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
