import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsSeen,
  sendNotification,
} from "@/lib/api/notifications";
import { Notification, SendNotificationPayload } from "@/types/notification";

export function useNotifications(itemsPerPage: number = 20) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getNotifications(page, itemsPerPage);
        setNotifications(response.data);
        setCurrentPage(response.meta.currentPage);
        setTotalPages(response.meta.totalPages);
        setTotalItems(response.meta.totalItems);
      } catch (err) {
        setError("فشل في تحميل الإشعارات");
        console.error("Error fetching notifications:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage],
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadNotificationsCount();
      setUnreadCount(response.data);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, []);

  // Mark as seen
  const markAsSeen = useCallback(async (id: string) => {
    try {
      await markNotificationAsSeen(id);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, seen: true } : notif,
        ),
      );
      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as seen:", err);
      throw err;
    }
  }, []);

  // Send notification
  const send = useCallback(
    async (payload: SendNotificationPayload) => {
      try {
        await sendNotification(payload);
        // Refresh notifications after sending
        await fetchNotifications(currentPage);
      } catch (err) {
        console.error("Error sending notification:", err);
        throw err;
      }
    },
    [currentPage, fetchNotifications],
  );

  // Initial load
  useEffect(() => {
    fetchNotifications(1);
    fetchUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPerPage]);

  return {
    notifications,
    unreadCount,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsSeen,
    send,
  };
}
