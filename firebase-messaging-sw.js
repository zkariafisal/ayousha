importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA5srAIJRXItE5uT9OKpRq0gHeEUeatDp0',
  authDomain: 'ayousha.firebaseapp.com',
  databaseURL: 'https://ayousha-default-rtdb.firebaseio.com',
  projectId: 'ayousha',
  storageBucket: 'ayousha.firebasestorage.app',
  messagingSenderId: '68680035248',
  appId: '1:68680035248:web:212c41987a40628969c475'
});

const messaging = firebase.messaging();

/* ================================================================
   ✅ الإصلاح الجوهري: تخزين دور الجهاز في Cache API (دائم)
   يُكتب من صفحة index.html، ويُقرأ هنا في SW
   ================================================================ */
const ROLE_CACHE = 'ayousha-role-v1';

async function getMyRole() {
  try {
    const cache = await caches.open(ROLE_CACHE);
    const resp = await cache.match('/__my_role__');
    if (!resp) return null;
    const text = (await resp.text()).trim();
    return (text === 'me' || text === 'her') ? text : null;
  } catch (e) { return null; }
}

async function setMyRole(role) {
  try {
    const cache = await caches.open(ROLE_CACHE);
    await cache.put('/__my_role__', new Response(role, {
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }
    }));
    console.log('[SW] 🎯 تم تعيين دور الجهاز:', role);
  } catch (e) { console.warn('[SW] فشل حفظ الدور:', e); }
}

/* استقبال الدور من الصفحة عبر postMessage */
self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'SET_ROLE' && (data.role === 'me' || data.role === 'her')) {
    event.waitUntil(setMyRole(data.role));
  }
});

/* رموز الإشعارات */
const symbols = {
  mail: '💌', game: '🎮', surprise: '🎁', memory: '📸',
  ping: '💗', mood: '🌙', answer: '📝', quiz: '🧠',
  dailyShared: '🌟', random: '🎲', interactiveGift: '🎁', gift: '🎁',
  balderdash: '🌀', fibbage: '🤥', codenames: '🕵️', werewolf: '🐺',
  resistance: '🎭', xo: '❌⭕', story: '📖', trivia: '🧠',
  puzzle: '🧩', telepathy: '💞', spin: '🎡', draw: '🎨',
  guessNum: '🔢', cards: '💌', doors: '🚪'
};

/* ================================================================
   ✅ الإصلاح الحرج: التحقق من الدور قبل عرض الإشعار
   ================================================================ */
messaging.onBackgroundMessage(async payload => {
  const d = payload.data || {};
  const type = d.type || 'game';
  const itemId = d.itemId || '';
  const notifRole = d.role === 'her' ? 'her' : (d.role === 'me' ? 'me' : null);

  // ✅ الخطوة 1: جلب دور هذا الجهاز من الكاش
  const myRole = await getMyRole();

  // ✅ الخطوة 2: إذا عرفنا دورنا وكان الإشعار لغيرنا ← تجاهل تماماً
  if (myRole && notifRole && notifRole !== myRole) {
    console.log(`[SW] 🚫 إشعار مُوجّه لـ "${notifRole}" — جهازي هو "${myRole}" — تجاهل`);
    return; // لا نعرض الإشعار إطلاقاً
  }

  // إذا لم نعرف دورنا أو لم نعرف المرسل إليه ← نعرض (fallback آمن)
  if (!myRole) {
    console.warn('[SW] ⚠️ دور الجهاز غير محفوظ بعد — قد يظهر إشعار خاطئ. سيُصلح بعد فتح التطبيق.');
  }

  const role = notifRole || 'me';
  const base = self.registration.scope || (self.location.origin + '/');
  const url = new URL(base);
  if (url.pathname.endsWith('/')) url.pathname += 'index.html';
  url.searchParams.set('for', role);
  url.searchParams.set('open', type);
  if (itemId) url.searchParams.set('item', itemId);

  const icon = symbols[type] || symbols[itemId] || '🔔';
  const title = (d.title || 'عيون عيوشة 🌸').startsWith(icon) ? d.title : `${icon} ${d.title || 'رسالة جديدة'}`;

  return self.registration.showNotification(title, {
    body: d.body || 'اضغط هنا للفتح والدخول المباشر',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: `ayousha-${type}-${itemId || Date.now()}`,
    vibrate: [200, 100, 200, 100, 200],
    silent: false,
    requireInteraction: true,
    renotify: true,
    timestamp: Date.now(),
    data: { url: url.href, type, itemId, role }
  });
});

/* ================================================================
   ✅ عند النقر: فتح التطبيق والانتقال للشيء المطلوب
   ================================================================ */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const details = event.notification.data || {};
  const openType = details.type || 'game';
  const itemId = details.itemId || '';
  const role = details.role || 'me';

  let targetUrl;
  try {
    const base = self.registration.scope || (self.location.origin + '/');
    const u = new URL(base);
    if (u.pathname.endsWith('/')) u.pathname += 'index.html';
    if (details.url) {
      try {
        const parsed = new URL(details.url, self.location.origin);
        u.pathname = parsed.pathname;
        parsed.searchParams.forEach((v, k) => u.searchParams.set(k, v));
      } catch (_) {}
    }
    u.searchParams.set('for', role);
    u.searchParams.set('open', openType);
    if (itemId) u.searchParams.set('item', itemId);
    targetUrl = u.href;
  } catch (_) {
    targetUrl = details.url || self.registration.scope || '/index.html';
  }

  event.waitUntil((async () => {
    const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    for (const client of windowClients) {
      try {
        if ('focus' in client) await client.focus();
        if ('navigate' in client && client.url !== targetUrl) await client.navigate(targetUrl);
        client.postMessage({
          type: 'OPEN_AYOUSHA_DESTINATION',
          open: openType,
          item: itemId,
          role,
          url: targetUrl
        });
        return;
      } catch (err) {
        console.warn('[SW] خطأ في التركيز على النافذة:', err);
      }
    }

    if (clients.openWindow) await clients.openWindow(targetUrl);
  })());
});