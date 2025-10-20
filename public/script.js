// ✅ تسجيل الـ Service Worker لتفعيل PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.log('✅ Service Worker مسجل بنجاح:', reg.scope))
      .catch((err) => console.error('❌ فشل تسجيل Service Worker:', err));
  });
}
