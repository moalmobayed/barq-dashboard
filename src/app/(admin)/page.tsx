import type { Metadata } from "next";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import React from "react";
import MonthlyTarget from "@/components/dashboard/MonthlyTarget";
import OrdersStatusChart from "@/components/dashboard/OrdersStatusChart";
import VendorsPerformanceChart from "@/components/dashboard/VendorsPerformanceChart";
import RecentOrders from "@/components/dashboard/RecentOrders";
import SettingsCard from "@/components/dashboard/SettingsCard";

export const metadata: Metadata = {
  title: "لوحة التحكم | برق",
  description: "لوحة تحكم برق مع مقاييس، مخططات، وطلبات حديثة",
  authors: [
    {
      name: "Mohamed Tarek",
    },
  ],
};

export default function Overview() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <MetricsCards />

        <OrdersStatusChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <VendorsPerformanceChart />
      </div>

      <div className="col-span-12">
        <RecentOrders />
      </div>

      <div className="col-span-12">
        <SettingsCard />
      </div>
    </div>
  );
}
