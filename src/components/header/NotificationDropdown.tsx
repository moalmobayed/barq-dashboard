"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsSeen,
} from "@/lib/api/notifications";
import { Notification } from "@/types/notification";

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications and unread count
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [notificationsRes, unreadRes] = await Promise.all([
        getNotifications(1, 5), // Get latest 5 notifications
        getUnreadNotificationsCount(),
      ]);
      setNotifications(notificationsRes.data);
      setUnreadCount(unreadRes.data);
      
      // Trigger event to notify other components about new data
      window.dispatchEvent(new CustomEvent('notifications-updated', { 
        detail: { timestamp: Date.now() } 
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as seen if not already seen
    if (!notification.seen) {
      try {
        await markNotificationAsSeen(notification._id);
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notification._id ? { ...notif, seen: true } : notif,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as seen:", error);
      }
    }

    // Navigate to order if metadata exists
    if (notification.metadata) {
      closeDropdown();
      router.push(`/orders/${notification.metadata}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / 60000);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 1) return "الآن";
      if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
      if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
      if (diffInDays === 1) return "أمس";
      if (diffInDays < 7) return `منذ ${diffInDays} أيام`;

      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative">
      <button
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute end-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            unreadCount === 0 ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="shadow-theme-lg dark:bg-gray-dark absolute !-end-40 mt-[17px] flex h-[480px] w-[330px] flex-col rounded-2xl border border-gray-200 bg-white p-3 sm:w-[361px] lg:!end-0 dark:border-gray-800"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            الإشعارات {unreadCount > 0 && `(${unreadCount})`}
          </h5>
          <button
            onClick={toggleDropdown}
            className="dropdown-toggle text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="border-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-500 dark:text-gray-400">
              لا توجد إشعارات
            </div>
          ) : (
            notifications.map((item) => (
              <li key={item._id}>
                <DropdownItem
                  onItemClick={() => handleNotificationClick(item)}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                    !item.seen ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <span className="bg-primary-100 dark:bg-primary-900/30 relative z-1 flex h-10 w-full max-w-10 items-center justify-center rounded-full">
                    {!item.seen && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500"></span>
                    )}
                    <svg
                      className="text-primary-600 dark:text-primary-400 h-5 w-5"
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
                  </span>

                  <span className="block flex-1">
                    <span className="text-theme-sm mb-1.5 block text-start">
                      <span className="block font-medium text-gray-800 dark:text-white/90">
                        {item.titleAr}
                      </span>
                      <span className="block text-sm text-gray-600 dark:text-gray-400">
                        {item.contentAr.length > 60
                          ? `${item.contentAr.slice(0, 60)}...`
                          : item.contentAr}
                      </span>
                    </span>

                    <span className="text-theme-xs flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <span>{item.type}</span>
                      <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                      <span>{formatDate(item.createdAt)}</span>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>

        <Link
          href="/notifications"
          onClick={closeDropdown}
          className="mt-3 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          عرض كل الإشعارات
        </Link>
      </Dropdown>
    </div>
  );
}
