"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import React from "react";
import "react-loading-skeleton/dist/skeleton.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ms-0"
    : isExpanded || isHovered
      ? "lg:ms-[290px]"
      : "lg:ms-[90px]";

  return (
    <ProtectedRoute>
      <div className="min-h-screen overflow-x-hidden xl:flex">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 overflow-x-hidden transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader />
          {/* Page Content */}
          <div className="mx-auto max-w-(--breakpoint-2xl) overflow-x-hidden p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
