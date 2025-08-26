// ================================
// ✅ اختيار دور المستخدم
// ================================
function selectRole(role) {
  sessionStorage.setItem("role", role);

  const rolePages = {
    staff: "staff_menu.html",
    student: "student_menu.html"
  };

  const page = rolePages[role];
  if (page) {
    window.location.href = page;
  } else {
    alert("الدور غير معروف!");
  }
}

// ✅ ربط الأزرار برمجياً
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("studentBtn").addEventListener("click", () => selectRole("student"));
  document.getElementById("staffBtn").addEventListener("click", () => selectRole("staff"));
});
