// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// This config is loaded dynamically - the service worker reads from the page
// Firebase config will be injected at build time via environment variables
firebase.initializeApp({
  apiKey: "REACT_APP_FIREBASE_API_KEY_PLACEHOLDER",
  authDomain: "balina-d69d2.firebaseapp.com",
  projectId: "balina-d69d2",
  storageBucket: "balina-d69d2.firebasestorage.app",
  messagingSenderId: "REACT_APP_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER",
  appId: "REACT_APP_FIREBASE_APP_ID_PLACEHOLDER",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);

  const { title, body } = payload.notification || {};
  const data = payload.data || {};

  const notificationTitle = title || '🐳 USDT Balina Transferi!';
  const notificationOptions = {
    body: body || `${data.amountFormatted || ''} USDT transfer edildi`,
    icon: '/icon.png',
    badge: '/icon.png',
    tag: `whale-${data.txHash || Date.now()}`,
    data: {
      url: data.txHash ? `https://etherscan.io/tx/${data.txHash}` : '/',
      ...data,
    },
    actions: [
      { action: 'view', title: 'Etherscan\'da Gör' },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
