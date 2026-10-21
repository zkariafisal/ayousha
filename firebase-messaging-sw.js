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
 const url=new URL(self.registration.scope);
 url.searchParams.set('for',d.role==='her'?'her':'me');
 url.searchParams.set('open',type);
 if(d.itemId)url.searchParams.set('item',d.itemId);
 return self.registration.showNotification((symbols[type]||'🔔')+' '+(d.title||'رسالة جديدة'),{
  body:d.body||'افتح التطبيق للاطلاع',
  icon:'/icon.png',badge:'/icon.png',
  tag:'ayousha-'+type+'-'+(d.itemId||Date.now()),
  vibrate:[180,90,180],silent:false,requireInteraction:false,
  data:{url:url.href}
 });
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=event.notification.data?.url||self.registration.scope;
 event.waitUntil((async()=>{
  const windows=await clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){
   if(new URL(client.url).origin===new URL(target).origin){
    if('navigate' in client)await client.navigate(target);
    await client.focus();return;
   }
  }
  await clients.openWindow(target);
 })());
});
