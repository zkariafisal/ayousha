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

const symbols = {
  mail: '💌',
  game: '🎮',
  surprise: '🎁',
  memory: '📸',
  ping: '💗',
  mood: '🌙',
  answer: '📝',
  quiz: '🧠',
  dailyShared: '🌟',
  random: '🎲'
};

// استقبال الإشعارات في الخلفية وتوجيه الرابط بدقة
messaging.onBackgroundMessage(payload => {
  const d = payload.data || {};
  const type = d.type || 'game';
  const itemId = d.itemId || '';
  const role = d.role === 'her' ? 'her' : 'me';

  const base = self.registration.scope || self.location.origin + '/';
  const url = new URL(base);
  if (url.pathname.endsWith('/')) {
    url.pathname += 'index.html';
  }
  url.searchParams.set('for', role);
  url.searchParams.set('open', type);
  if (itemId) url.searchParams.set('item', itemId);

  const icon = symbols[type] || '🔔';
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
    data: {
      url: url.href,
      type,
      itemId,
      role
    }
  });
});

// عند نقر المستخدم على الإشعار من شاشة القفل أو مركز إشعارات الهاتف
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const details = event.notification.data || {};
  const openType = details.type || 'game';
  const itemId = details.itemId || '';
  const role = details.role || 'me';

  // بناء الرابط المقصود بدقة
  let targetUrl;
  try {
    const base = self.registration.scope || self.location.origin + '/';
    const u = new URL(base);
    if (u.pathname.endsWith('/')) {
      u.pathname += 'index.html';
    }
    if (details.url) {
      try {
        const parsed = new URL(details.url, self.location.origin);
        u.pathname = parsed.pathname;
        parsed.searchParams.forEach((val, key) => u.searchParams.set(key, val));
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

    // إذا كان التطبيق مفتوحاً في الخلفية
    for (const client of windowClients) {
      try {
        if ('focus' in client) await client.focus();
        if ('navigate' in client && client.url !== targetUrl) {
          await client.navigate(targetUrl);
        }
        client.postMessage({
          type: 'OPEN_AYOUSHA_DESTINATION',
          open: openType,
          item: itemId,
          role,
          url: targetUrl
        });
        return;
      } catch (err) {
        console.warn('Focus existing client error:', err);
      }
    }

    // إذا كان التطبيق مقفلاً تماماً، افتح نافذة جديدة مباشرة بالرابط والوجهة المحددة
    if (clients.openWindow) {
      await clients.openWindow(targetUrl);
    }
  })());
});
