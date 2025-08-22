// إظهار شاشة تسجيل الدخول للموظف
function showLogin() {
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("username").focus();
}
// رجوع للشاشة الرئيسية
function backToStart() {
  document.getElementById("startScreen").classList.remove("hidden");
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("menuContainer").classList.add("hidden");
  document.getElementById("viewerContainer").classList.add("hidden");
}

// دخول الطالب مباشرة بدون شاشة وسطية
function enterStudent() {
  // ✅ أول شيء نخفي شاشة البداية
  document.getElementById("startScreen").classList.add("hidden");

  // ✅ تحميل قائمة الطالب
  fetch("/api/menu/student")
    .then(res => res.json())
    .then(data => showMenu(data.menu))
    .catch(err => alert("⚠ خطأ في تحميل القائمة: " + err));
}

// تسجيل دخول الموظف
function loginStaff() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // ✅ نخفي شاشة البداية وتسجيل الدخول
        document.getElementById("startScreen").classList.add("hidden");
        document.getElementById("loginScreen").classList.add("hidden");

        // ✅ نعرض القائمة الخاصة بالموظف
        fetch("/api/menu/staff")
          .then(res => res.json())
          .then(data => showMenu(data.menu));
      } else {
        alert("❌ " + data.message);
      }
    })
    .catch(err => alert("⚠ خطأ في تسجيل الدخول: " + err));
}
// عرض القائمة
function showMenu(menu) {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("menuContainer").classList.remove("hidden");

  const list = document.getElementById("menuList");
  list.innerHTML = "";

  menu.forEach(item => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = item.title;

    if (item.type === "pdf") {
      btn.onclick = () => openPdf(item.filename);
    } else if (item.type === "external") {
      btn.onclick = () => window.open(item.url, "_blank");
    } else if (item.type === "page") {
      btn.onclick = () => window.location.href = item.path;
    }

    li.appendChild(btn);
    list.appendChild(li);
  });
}

// فتح PDF داخل iframe
function openPdf(filename) {
  document.getElementById("menuContainer").classList.add("hidden");
  const viewer = document.getElementById("viewerContainer");
  const iframe = document.getElementById("pdfFrame");

  iframe.src = `/pdfjs/web/viewer.html?file=/api/pdfs/${filename}`;
  viewer.classList.remove("hidden");
}

// زر الرجوع من العارض
document.getElementById("backButton").addEventListener("click", () => {
  document.getElementById("viewerContainer").classList.add("hidden");
  document.getElementById("menuContainer").classList.remove("hidden");
});

// ربط الدوال بالنافذة العالمية لاستخدامها من HTML
window.showLogin = showLogin;
window.enterStudent = enterStudent;
window.loginStaff = loginStaff;
window.backToStart = backToStart;
