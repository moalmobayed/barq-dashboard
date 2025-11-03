// lib/firebase/config.ts
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCjGwjX2s5lF2_278nyPxXgXvTaMWZ8Ve8",
  authDomain: "barq-f7cbb.firebaseapp.com",
  projectId: "barq-f7cbb",
  storageBucket: "barq-f7cbb.firebasestorage.app",
  messagingSenderId: "138875212733",
  appId: "1:138875212733:web:2d8e42262bc8e8cbd838d4",
  measurementId: "G-RVGYBYRSLD",
};

// Initialize Firebase only if not already initialized
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize messaging only in browser environment
let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, messaging };
