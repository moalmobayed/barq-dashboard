"use client";

import { useEffect, useState } from "react";
import { onMessageListener, getCurrentToken } from "@/lib/firebase/fcm";
import { getAuthToken } from "@/lib/api/auth";
import { updateAdminProfile } from "@/lib/api/profile";

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, string>;
}

export default function NotificationHandler() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run on client side and if user is authenticated
    if (typeof window === "undefined") return;

    const authToken = getAuthToken();
    if (!authToken) return;

    const setupNotifications = async () => {
      try {
        // Check if service worker is supported
        if (!("serviceWorker" in navigator)) {
          return;
        }

        // Wait a bit for service worker to be ready
        await navigator.serviceWorker.ready;

        // Check if permission is already granted and get token
        // This will NOT trigger the permission prompt
        const token = await getCurrentToken();

        if (token) {
          // Send token to backend
          await sendTokenToBackend(token);
        }

        setIsInitialized(true);
      } catch (error) {
        setIsInitialized(true);
        console.error(error);
      }
    };

    // Only setup once
    if (!isInitialized) {
      setupNotifications();
    }
  }, [isInitialized]);

  useEffect(() => {
    // Listen for foreground messages
    if (!isInitialized) return;

    onMessageListener()
      .then((payload: unknown) => {
        showNotification(payload as NotificationPayload);
      })
      .catch((err) => console.error("Failed to receive message:", err));
  }, [isInitialized]);

  const sendTokenToBackend = async (token: string) => {
    try {
      // Send FCM token to backend using updateAdminProfile API
      await updateAdminProfile({ fcmToken: token });

      // Store in localStorage as backup
      localStorage.setItem("fcmToken", token);
    } catch (error) {
      console.error("Error sending token to backend:", error);
      // Still store in localStorage even if API call fails
      localStorage.setItem("fcmToken", token);
    }
  };

  const showNotification = (payload: NotificationPayload) => {
    if (!payload.notification) return;

    const { title, body } = payload.notification;

    // Show browser notification if permission is granted
    if (Notification.permission === "granted") {
      new Notification(title || "إشعار جديد", {
        body: body || "",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  };

  // This component doesn't render anything
  return null;
}
