"use client";
import React from "react";
import { Notification } from "@/types/notification";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";

interface NotificationsTableProps {
  notifications: Notification[];
  onMarkAsSeen: (id: string) => void;
  isLoading?: boolean;
}

export default function NotificationsTable({
  notifications,
  onMarkAsSeen,
  isLoading = false,
}: NotificationsTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "vendor":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "customer":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "order":
        return "طلب";
      case "vendor":
        return "متجر";
      case "customer":
        return "عميل";
      default:
        return type;
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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary-500 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">لا توجد إشعارات</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="text-start font-medium">
                  العنوان
                </TableCell>
                <TableCell isHeader className="text-start font-medium">
                  المحتوى
                </TableCell>
                <TableCell isHeader className="text-start font-medium">
                  النوع
                </TableCell>
                <TableCell isHeader className="text-start font-medium">
                  الحالة
                </TableCell>
                <TableCell isHeader className="text-start font-medium">
                  التاريخ
                </TableCell>
                <TableCell isHeader className="text-start font-medium">
                  الإجراءات
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {notifications.map((notification) => (
                <TableRow
                  key={notification._id}
                  className={`${
                    !notification.seen && "bg-blue-50/90 dark:bg-blue-900/10"
                  }`}
                >
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {!notification.seen && (
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                      <p className="font-medium text-gray-900 dark:text-white">
                        {notification.titleAr}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {notification.contentAr}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTypeColor(notification.type)}`}
                    >
                      {getTypeLabel(notification.type)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    {notification.seen ? (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        مقروء
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <circle cx="10" cy="10" r="5" />
                        </svg>
                        جديد
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(notification.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      {!notification.seen && (
                        <button
                          onClick={() => onMarkAsSeen(notification._id)}
                          className="rounded-md bg-blue-100/50 p-2 text-sm font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-700/5 dark:text-blue-400 dark:hover:bg-blue-700/10 dark:hover:text-blue-300"
                        >
                          تعليم كمقروء
                        </button>
                      )}
                      {notification.metadata && (
                        <Link
                          href={`/orders/${notification.metadata}`}
                          className="rounded-md bg-blue-100/50 p-2 text-sm font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-700/5 dark:text-blue-400 dark:hover:bg-blue-700/10 dark:hover:text-blue-300"
                          title="عرض الطلب"
                        >
                          عرض الطلب
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
