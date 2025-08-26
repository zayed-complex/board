// ✅ تحميل القائمة حسب الدور
async function loadMenu(role) {
  try {
    const res = await fetch(`/api/menu/${role}`);
    if (!res.ok) throw new Error("خطأ في تحميل القائمة");
    const menu = await res.json(); // مصفوفة مباشرة

    const container = document.getElementById("menuContainer");
    container.innerHTML = "";

    (menu || []).forEach(item => {
      const btn = document.createElement("button");
      btn.className = "menu-btn";
      btn.textContent = item.title;

      if (item.type === "pdf") {
        btn.onclick = () => openPdf(item.filename);
      } else if (item.type === "page") {
        btn.onclick = () => window.location.href = item.path;
      } else if (item.type === "external") {
        btn.onclick = () => window.open(item.url, "_blank");
      } else if (item.type === "submenu") {
        btn.onclick = () => window.location.href = `/policies.html?role=${role}`;
      }
      container.appendChild(btn);
    });

    if (!menu || menu.length === 0) {
      container.innerHTML = "<p>لا توجد عناصر في القائمة</p>";
    }
  } catch (err) {
    console.error("⚠ خطأ:", err);
    alert("تعذر تحميل القائمة");
  }
}

// ✅ فتح PDF
function openPdf(filename) {
  window.location.href = `/api/pdfs/${filename}`;
}

// ✅ عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") || sessionStorage.getItem("role");
  if (role) {
    loadMenu(role);
  }
});
