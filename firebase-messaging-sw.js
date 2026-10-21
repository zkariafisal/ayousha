importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey:'AIzaSyA5srAIJRXItE5uT9OKpRq0gHeEUeatDp0',
  authDomain:'ayousha.firebaseapp.com',
  databaseURL:'https://ayousha-default-rtdb.firebaseio.com',
  projectId:'ayousha',
  storageBucket:'ayousha.firebasestorage.app',
  messagingSenderId:'68680035248',
  appId:'1:68680035248:web:212c41987a40628969c475'
});
const messaging=firebase.messaging();
const symbols={mail:'💌',surprise:'🎁',memory:'📸',ping:'💗',mood:'🌙',answer:'📝'};
messaging.onBackgroundMessage(payload=>{
 const d=payload.data||{};
 const type=d.type||'notification';
 const url=new URL('/index.html',self.location.origin);
 url.searchParams.set('for',d.role==='her'?'her':'me');
 url.searchParams.set('open',type);
 if(d.itemId)url.searchParams.set('item',d.itemId);
 return self.registration.showNotification((symbols[type]||'🔔')+' '+(d.title||'رسالة جديدة'),{
  body:d.body||'افتح التطبيق للاطلاع',
  icon:'/icon.png',badge:'/icon.png',
  tag:'ayousha-'+type+'-'+(d.itemId||Date.now()),
  vibrate:[180,90,180],silent:false,requireInteraction:false,
  data:{url:url.href,type,itemId:d.itemId||''}
 });
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const details = event.notification.data || {};
  let target;
  try {
    target = new URL(details.url || '/index.html', self.location.origin);
    // Always use the deployed site's entry point; prevent 404 on unknown paths.
    if (target.origin !== self.location.origin) target = new URL('/index.html', self.location.origin);
    target.pathname = '/index.html';
  } catch (_) { target = new URL('/index.html', self.location.origin); }
  event.waitUntil((async () => {
    const pages = await clients.matchAll({ type:'window', includeUncontrolled:true });
    for (const page of pages) {
      if (new URL(page.url).origin !== target.origin) continue;
      try {
        if ('navigate' in page) {
          const navigated = await page.navigate(target.href);
          if (navigated) { await navigated.focus(); return; }
        }
        await page.focus();
        page.postMessage({ type:'OPEN_AYOUSHA', url:target.href });
        return;
      } catch (error) { console.warn('Notification navigation:',error); }
    }
    await clients.openWindow(target.href);
  })());
});
