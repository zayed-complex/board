// ================================
// ✅ تحميل القائمة حسب الدور
// ================================
async function loadMenu(role) {
  const container = document.getElementById("menuContainer");
  container.innerHTML = "";

  if (!role) {
    container.innerHTML = "<p>يرجى اختيار دور للمتابعة</p>";
    return;
  }

  try {
    const res = await fetch(`/api/menu/${role}`);
    if (!res.ok) throw new Error("خطأ في تحميل القائمة");

    const menu = await res.json();

    if (!menu || menu.length === 0) {
      container.innerHTML = "<p>لا توجد عناصر في القائمة</p>";
      return;
    }

    menu.forEach(item => {
      const btn = document.createElement("button");
      btn.className = "menu-btn";
      btn.textContent = item.title;

      switch (item.type) {
        case "pdf":
          btn.onclick = () => openPdf(item.filename);
          break;
        case "page":
          btn.onclick = () => window.location.href = item.path;
          break;
        case "external":
          btn.onclick = () => window.open(item.url, "_blank");
          break;
        case "submenu":
          btn.onclick = () => window.location.href = `/policies.html?role=${role}`;
          break;
        default:
          console.warn("نوع عنصر غير معروف:", item);
      }

      container.appendChild(btn);
    });

  } catch (err) {
    console.error("⚠ خطأ:", err);
    container.innerHTML = "<p>تعذر تحميل القائمة، يرجى المحاولة لاحقًا</p>";
  }
}

// ================================
// ✅ فتح PDF في نافذة جديدة
// ================================
function openPdf(filename) {
  if (!filename) return;
  window.open(`/api/pdfs/${filename}`, "_blank");
}

// ================================
// ✅ تحميل القائمة عند تحميل الصفحة
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") || sessionStorage.getItem("role");
  loadMenu(role);
});

// ================================
// ✅ اختيار دور المستخدم
// ================================
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
