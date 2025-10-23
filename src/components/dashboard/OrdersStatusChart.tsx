"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { getDashboardOrdersAnalytics } from "@/lib/api/dashboard";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function OrdersStatusChart() {
  type OrderStatusAnalytics = {
    orderStatus:
      | "pending"
      | "processing"
      | "completed"
      | "cancelled"
      | "shipped";
    count: number;
    totalAmount: number;
  };

  const [ordersByStatus, setOrdersByStatus] = useState<OrderStatusAnalytics[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboardOrdersAnalytics().then((data) => {
      setOrdersByStatus(data.ordersByStatus || []);
      setLoading(false);
    });
  }, []);

  const options: ApexOptions = {
    colors: ["#465fff", "#22c55e", "#f59e42", "#e11d48", "#3b82f6"],
    chart: {
      fontFamily: "Cairo, sans-serif",
      type: "bar",
      height: 240,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: ordersByStatus.map((s) => {
        const map: Record<string, string> = {
          pending: "قيد الانتظار",
          processing: "جارِ التنفيذ",
          completed: "تم التوصيل",
          cancelled: "ملغاة",
          shipped: "تم الشحن",
        };
        return map[s.orderStatus] ?? s.orderStatus;
      }),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
    },
    yaxis: { title: { text: undefined } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
    },
  };
  const series = [
    {
      name: "عدد الطلبات",
      data: ordersByStatus.map((s) => s.count),
    },
    {
      name: "إجمالي المبلغ",
      data: ordersByStatus.map((s) => s.totalAmount),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        حالة الطلبات
      </h3>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="-ms-5 min-w-[650px] ps-2 xl:min-w-full">
          {loading ? (
            <div className="py-12 text-center text-gray-400">
              جاري التحميل...
            </div>
          ) : (
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={240}
            />
          )}
        </div>
      </div>
    </div>
  );
}
