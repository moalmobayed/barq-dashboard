// Firebase Cloud Messaging Service Worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCjGwjX2s5lF2_278nyPxXgXvTaMWZ8Ve8",
  authDomain: "barq-f7cbb.firebaseapp.com",
  projectId: "barq-f7cbb",
  storageBucket: "barq-f7cbb.firebasestorage.app",
  messagingSenderId: "138875212733",
  appId: "1:138875212733:web:2d8e42262bc8e8cbd838d4",
  measurementId: "G-RVGYBYRSLD",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "إشعار جديد";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data,
    tag: payload.messageId,
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Open the app or focus existing window
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow("/notifications");
        }
      }),
  );
});
