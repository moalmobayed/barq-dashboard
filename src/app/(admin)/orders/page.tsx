// src/app/(admin)/orders/page.tsx

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrdersTable from "@/components/orders/OrdersTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "الطلبات | برق",
  description: "هذه هي صفحة الطلبات حيث يمكنك إدارة بيانات الطلبات.",
};

export default function Orders() {
  return (
    <div className="max-w-full overflow-x-hidden">
      <PageBreadcrumb pageTitle="الطلبات" />

      <div
        className={`max-w-full space-y-6 overflow-x-hidden rounded-2xl border border-t border-gray-100 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]`}
      >
        <OrdersTable />
      </div>
    </div>
  );
}
