// lib/firebase/fcm.ts
import { getToken, onMessage, Messaging } from "firebase/messaging";
import { messaging } from "./config";

const VAPID_KEY =
  "BP5jAQMa5UL26wA3JxQc6At6KmBebIswHjiH4GjWfv0Uq6KX_W4inrUojQ7Pe_F16GvDaEpnqBtQ3eAf43laRxI";

export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      return null;
    }

    // Request permission from the user
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      // Wait for messaging to be initialized
      if (!messaging) {
        return null;
      }

      // Get FCM token
      const token = await getToken(messaging as Messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        return token;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = (): Promise<unknown> =>
  new Promise((resolve) => {
    if (!messaging) {
      return;
    }

    onMessage(messaging as Messaging, (payload) => {
      resolve(payload);
    });
  });

// Get current FCM token without requesting permission
export const getCurrentToken = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      return null;
    }

    const permission = Notification.permission;
    if (permission !== "granted") {
      return null;
    }

    const token = await getToken(messaging as Messaging, {
      vapidKey: VAPID_KEY,
    });

    return token || null;
  } catch (error) {
    console.error("Error getting current token:", error);
    return null;
  }
};
