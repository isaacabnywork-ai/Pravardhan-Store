// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: NEXT_PUBLIC_FIREBASE_PROJECT_ID will be substituted or loaded dynamically
firebase.initializeApp({
  apiKey: "AIzaSy_DEV_KEY",
  authDomain: "pravdhan-store.firebaseapp.com",
  projectId: "pravdhan-store",
  storageBucket: "pravdhan-store.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Pravdhan Store Update';
  const notificationOptions = {
    body: payload.notification?.body || 'Your order status has changed.',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
