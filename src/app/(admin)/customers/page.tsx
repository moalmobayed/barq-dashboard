// src/app/(admin)/customers/page.tsx

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CustomersTable from "@/components/customers/CustomersTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "العملاء | برق",
  description: "هذه هي صفحة العملاء حيث يمكنك إدارة بيانات العملاء.",
};

export default function customers() {
  return (
    <div>
      <PageBreadcrumb pageTitle="العملاء" />

      <div
        className={`space-y-6 rounded-2xl border border-t border-gray-100 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]`}
      >
        <CustomersTable />
      </div>
    </div>
  );
}
