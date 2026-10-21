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

// استقبال الإشعارات والهاتف مقفل
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://raw.githubusercontent.com/zkariafisal/Oreo-quiz-images/refs/heads/main/Aa.png',
    badge: 'https://raw.githubusercontent.com/zkariafisal/Oreo-quiz-images/refs/heads/main/Aa.png',
    vibrate: [200, 100, 200]
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
