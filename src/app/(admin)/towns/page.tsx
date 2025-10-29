// src/app/(admin)/towns/page.tsx

import TownsTable from "@/components/towns/TownsTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "المناطق | برق",
  description: "هذه هي صفحة المناطق حيث يمكنك إدارة بيانات المناطق.",
};

export default function Towns() {
  return (
    <div>
      <PageBreadcrumb pageTitle="المناطق" />

      <div
        className={`space-y-6 rounded-2xl border border-t border-gray-100 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]`}
      >
        <TownsTable />
      </div>
    </div>
  );
}
