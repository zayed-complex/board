// دالة اختيار الدور
function selectRole(role) {
  sessionStorage.setItem("role", role);

  const rolePages = {
    staff: "staff_login.html",
    student: "student_menu.html"
  };

  const page = rolePages[role];
  if (page) {
    window.location.href = page;
  } else {
    alert("الدور غير معروف!");
  }
}

// ربط الأزرار بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  const studentBtn = document.getElementById("studentBtn");
  const staffBtn = document.getElementById("staffBtn");

  studentBtn.addEventListener("click", () => selectRole("student"));
  staffBtn.addEventListener("click", () => selectRole("staff"));
});

// اجعل selectRole متاحة عالميًا (لأزرار HTML التقليدية إذا استُخدمت)
window.selectRole = selectRole;
