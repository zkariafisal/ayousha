/* firebase-messaging-sw.js — ضعه في المجلد الرئيسي للموقع */
const ICON_URL = 'https://raw.githubusercontent.com/zkariafisal/Oreo-quiz-images/refs/heads/main/Aa.png';
const ROLE_CACHE_NAME = 'ayousha-role-v1';
let cachedRole = '';

async function getMyRole() {
  if (cachedRole) return cachedRole;
  try {
    const cache = await caches.open(ROLE_CACHE_NAME);
    const res = await cache.match('/__my_role__');
    if (res) {
      cachedRole = (await res.text()).trim();
      return cachedRole;
    }
  } catch (e) {}
  return '';
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_ROLE' && event.data.role) {
    cachedRole = event.data.role;
  }
});

// Intercept push BEFORE Firebase SW SDK so call notifications ALWAYS include Answer/Decline buttons + ringing sound/vibration
self.addEventListener('push', (event) => {
  try {
    const raw = event.data ? event.data.json() : null;
    const d = (raw && raw.data) ? raw.data : (raw || {});
    if (!d || (d.type !== 'call' && d.type !== 'call_missed')) return;

    event.stopImmediatePropagation();
    event.waitUntil((async () => {
      const myRole = await getMyRole();
      if (myRole && d.role && d.role !== myRole) return;

      const isIncomingCall = d.type === 'call';
      const callId = d.itemId || '';
      const title = d.title || raw?.notification?.title || (isIncomingCall ? '📞 مكالمة واردة' : '📞 مكالمة فائتة');
      const body = d.body || raw?.notification?.body || (isIncomingCall ? 'يرن الآن — اضغط للرد أو الرفض' : 'لم يتم الرد على المكالمة');

      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (isIncomingCall && clientsList.length > 0) {
        for (const client of clientsList) {
          client.postMessage({ type: 'INCOMING_CALL_RING', open: 'call', item: callId, role: d.role || myRole });
        }
      }

      const options = {
        body,
        icon: d.icon || ICON_URL,
        badge: ICON_URL,
        tag: 'ayousha-call-' + callId,
        renotify: true,
        silent: false,
        requireInteraction: isIncomingCall,
        vibrate: isIncomingCall ? [900, 300, 900, 300, 900, 300, 900] : [250, 100, 250],
        data: {
          url: d.url || ('/index.html?for=' + (d.role || myRole || 'her') + '&open=' + d.type + '&item=' + encodeURIComponent(callId)),
          type: d.type,
          itemId: callId,
          role: d.role || myRole
        }
      };

      if (isIncomingCall) {
        options.actions = [
          { action: 'answer', title: '📞 رد الآن' },
          { action: 'decline', title: '📵 رفض' }
        ];
      }

      await self.registration.showNotification(title, options);
    })());
  } catch (e) {}
});

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA5srAIJRXItE5uT9OKpRq0gHeEUeatDp0",
  authDomain: "ayousha.firebaseapp.com",
  databaseURL: "https://ayousha-default-rtdb.firebaseio.com",
  projectId: "ayousha",
  storageBucket: "ayousha.firebasestorage.app",
  messagingSenderId: "68680035248",
  appId: "1:68680035248:web:212c41987a40628969c475"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
  const d = payload.data || {};
  const myRole = await getMyRole();
  if (myRole && d.role && d.role !== myRole) return;

  const title = d.title || payload.notification?.title || 'عيون عيوشة 🌸';
  const body = d.body || payload.notification?.body || 'لديك إشعار جديد';
  const itemId = d.itemId || '';

  return self.registration.showNotification(title, {
    body,
    icon: d.icon || ICON_URL,
    badge: ICON_URL,
    tag: 'ayousha-' + (d.type || 'msg') + '-' + (itemId || Date.now()),
    renotify: true,
    silent: false,
    vibrate: [220, 100, 220],
    data: {
      url: d.url || ('/index.html?for=' + (d.role || myRole || 'her') + '&open=' + (d.type || 'notification') + '&item=' + encodeURIComponent(itemId)),
      type: d.type || 'notification',
      itemId,
      role: d.role || myRole
    }
  });
});

self.addEventListener('notificationclick', (event) => {
  const notif = event.notification;
  const data = notif.data || {};
  const action = event.action || '';
  notif.close();

  if (action === 'decline' && data.type === 'call') {
    event.waitUntil(
      fetch('https://ayousha-default-rtdb.firebaseio.com/app/calls/active.json', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined', endedAt: Date.now() })
      }).catch(() => {})
    );
    return;
  }

  event.waitUntil((async () => {
    const baseUrl = new URL(data.url || '/index.html', self.location.origin);
    if (action === 'answer') baseUrl.searchParams.set('action', 'answer');

    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) {
        await client.focus();
        client.postMessage({
          type: data.type === 'call' ? 'INCOMING_CALL_RING' : 'OPEN_AYOUSHA_DESTINATION',
          open: data.type,
          item: data.itemId,
          role: data.role,
          action,
          url: baseUrl.href
        });
        return;
      }
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(baseUrl.href);
    }
  })());
});
