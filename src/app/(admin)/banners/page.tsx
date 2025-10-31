// src/app/(admin)/banners/page.tsx

import BannersTable from "@/components/banners/BannersTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "البانرات | برق",
  description: "هذه هي صفحة البانرات حيث يمكنك إدارة بيانات البانرات.",
};

export default function Banners() {
  return (
    <div>
      <PageBreadcrumb pageTitle="البانرات" />

      <div
        className={`space-y-6 rounded-2xl border border-t border-gray-100 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]`}
      >
        <BannersTable />
      </div>
    </div>
  );
}
