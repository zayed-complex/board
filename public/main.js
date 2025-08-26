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

// ربط الأزرار بعد تحميل DOM
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("studentBtn").addEventListener("click", () => selectRole("student"));
  document.getElementById("staffBtn").addEventListener("click", () => selectRole("staff"));
});

// اجعل selectRole متاحة عالميًا
window.selectRole = selectRole;
