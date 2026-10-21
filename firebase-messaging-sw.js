// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// إعدادات مشروعك التي أرسلتها
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

// Data-only push: one notification, with a deep link to the correct section.
const icons={mail:'💌',surprise:'🎁',memory:'📸',ping:'💗',mood:'🌙',answer:'📝'};
messaging.onBackgroundMessage(async payload=>{
 const d=payload.data||{};const type=d.type||'notification';
 const url=new URL(self.registration.scope);
 url.searchParams.set('for',d.role||'me');url.searchParams.set('open',type);
 if(d.itemId)url.searchParams.set('item',d.itemId);
 await self.registration.showNotification((icons[type]||'🔔')+' '+(d.title||'إشعار جديد'),{
   body:d.body||'',icon:'https://raw.githubusercontent.com/zkariafisal/Oreo-quiz-images/refs/heads/main/Aa.png',
   badge:'https://raw.githubusercontent.com/zkariafisal/Oreo-quiz-images/refs/heads/main/Aa.png',
   tag:'ayousha-'+type+'-'+(d.itemId||Date.now()),vibrate:[120,80,150],
   data:{url:url.href},silent:false
 });
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const target=event.notification.data?.url||self.registration.scope;
 event.waitUntil((async()=>{
   const clientsList=await clients.matchAll({type:'window',includeUncontrolled:true});
   for(const client of clientsList){if(new URL(client.url).origin===new URL(target).origin){
     await client.focus();if('navigate' in client)await client.navigate(target);return;
   }}await clients.openWindow(target);
 })());
});
