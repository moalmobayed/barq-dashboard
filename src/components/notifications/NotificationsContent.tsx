"use client";

import React, { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationsTable from "@/components/notifications/NotificationsTable";
import SendNotificationModal from "@/components/notifications/SendNotificationModal";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { SendNotificationPayload } from "@/types/notification";
import { requestNotificationPermission } from "@/lib/firebase/fcm";
import { updateAdminProfile } from "@/lib/api/profile";
import Pagination from "@/components/tables/Pagination";

const limits = [5, 10, 20, 50];

export default function NotificationsContent() {
  const [limit, setLimit] = useState(10);
  const {
    notifications,
    unreadCount,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsSeen,
    send,
  } = useNotifications(limit);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    // Check notification permission status
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Listen for notification updates from dropdown
    const handleNotificationsUpdate = () => {
      fetchNotifications(currentPage);
      fetchUnreadCount();
    };

    window.addEventListener("notifications-updated", handleNotificationsUpdate);

    return () => {
      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdate,
      );
    };
  }, [currentPage, fetchNotifications, fetchUnreadCount]);

  const handleEnableNotifications = async () => {
    try {
      const token = await requestNotificationPermission();

      if (token) {
        setNotificationPermission("granted");

        // Store token in localStorage
        localStorage.setItem("fcmToken", token);

        // Send token to backend
        try {
          await updateAdminProfile({ fcmToken: token });
        } catch (apiError) {
          console.error("Failed to send FCM token to backend:", apiError);
          // Continue even if API call fails
        }

        setToast({
          variant: "success",
          title: "تم بنجاح",
          message: "تم تفعيل الإشعارات بنجاح",
        });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({
          variant: "error",
          title: "خطأ",
          message: "تم رفض صلاحية الإشعارات",
        });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      setToast({
        variant: "error",
        title: "خطأ",
        message: "فشل في تفعيل الإشعارات",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleMarkAsSeen = async (id: string) => {
    try {
      await markAsSeen(id);
      setToast({
        variant: "success",
        title: "تم بنجاح",
        message: "تم تعليم الإشعار كمقروء",
      });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({
        variant: "error",
        title: "خطأ",
        message: "فشل في تحديث الإشعار",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleSendNotification = async (payload: SendNotificationPayload) => {
    try {
      await send(payload);
      setToast({
        variant: "success",
        title: "تم بنجاح",
        message: "تم إرسال الإشعار بنجاح",
      });
      setTimeout(() => setToast(null), 3000);
      setIsModalOpen(false);
    } catch (err) {
      setToast({
        variant: "error",
        title: "خطأ",
        message: "فشل في إرسال الإشعار",
      });
      setTimeout(() => setToast(null), 3000);
      throw err;
    }
  };

  const handlePageChange = (page: number) => {
    fetchNotifications(page);
  };

  return (
    <>
      <div className="mb-6">
        <PageBreadCrumb pageTitle="الإشعارات" />
      </div>

      {/* Enable Push Notifications Banner */}
      {notificationPermission !== "granted" && (
        <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  تفعيل الإشعارات الفورية
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  قم بتفعيل الإشعارات للحصول على تنبيهات فورية عند وصول إشعارات
                  جديدة
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleEnableNotifications}
            >
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              تفعيل الإشعارات
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error-50 text-error-600 dark:bg-error-900/20 dark:text-error-400 mb-4 rounded-lg p-4">
          {error}
        </div>
      )}

      <div
        className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]`}
      >
        {/* Card Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              إدارة الإشعارات
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              إجمالي الإشعارات: {notifications.length} | غير المقروءة:{" "}
              {unreadCount}
            </p>
          </div>

          {/* Add Offer Button */}
          <div className="mb-4 flex justify-end px-6">
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              إرسال إشعار جديد
            </Button>
          </div>
        </div>

        {/* Card Body */}
        <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
          <div className="space-y-6">
            {/* Limit Selector */}
            <div className="flex items-center justify-end gap-2">
              <label
                htmlFor="limit"
                className="text-sm text-gray-600 dark:text-white/70"
              >
                صف في الصفحة:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/80"
              >
                {limits.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <NotificationsTable
              notifications={notifications}
              onMarkAsSeen={handleMarkAsSeen}
              isLoading={isLoading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <SendNotificationModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        onSend={handleSendNotification}
      />

      {toast && (
        <div className="fixed end-4 top-4 z-[9999] max-w-sm">
          <Alert {...toast} />
        </div>
      )}
    </>
  );
}
