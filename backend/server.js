app.get("/api/menu/:role", (req, res) => {
  const { role } = req.params;
  const gender = req.query.gender || "male";

  // يمكنك تخصيص القوائم كما تشاء
  const studentMenuMale = [
    { title: "📘 جداول البنين", type: "pdf", filename: "boys_schedule.pdf" },
    { title: "الخطة الأسبوعية", type: "external", url: "https://tinyurl.com/boysplan" }
  ];

  const studentMenuFemale = [
    { title: "📘 جداول البنات", type: "pdf", filename: "girls_schedule.pdf" },
    { title: "الخطة الأسبوعية", type: "external", url: "https://tinyurl.com/girlsplan" }
  ];

  const staffMenuMale = [
    { title: "📗 جداول المعلمين", type: "pdf", filename: "teachers_male.pdf" }
  ];

  const staffMenuFemale = [
    { title: "📗 جداول المعلمات", type: "pdf", filename: "teachers_female.pdf" }
  ];

  let menu;
  if (role === "student") {
    menu = gender === "female" ? studentMenuFemale : studentMenuMale;
  } else if (role === "staff") {
    menu = gender === "female" ? staffMenuFemale : staffMenuMale;
  } else {
    return res.status(400).send("❌ دور غير معروف");
  }

  res.json(menu);
});
