"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getRecentOrders } from "@/lib/api/orders";
import { Order } from "@/types/order";
import Button from "../ui/button/Button";
import { useRouter } from "next/navigation";

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getRecentOrders(5).then((data) => {
      setOrders(data);

      setLoading(false);
    });
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pt-4 pb-3 sm:px-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          الطلبات الحديثة
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/orders")}
        >
          عرض الكل
        </Button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="text-theme-xs py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                المنتجات
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                المستخدم
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                المتجر
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                الإجمالي
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                الحالة
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <td
                  colSpan={5}
                  className="py-6 text-center text-gray-400 dark:text-gray-500"
                >
                  جاري التحميل...
                </td>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <td
                  colSpan={5}
                  className="py-6 text-center text-gray-400 dark:text-gray-500"
                >
                  لا توجد طلبات حديثة
                </td>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                        <Image
                          width={50}
                          height={50}
                          src={
                            order.items?.[0]?.itemId?.image ||
                            "/images/product/product-01.jpg"
                          }
                          className="h-[50px] w-[50px]"
                          alt={order.items?.[0]?.itemId?.nameAr || "منتج"}
                        />
                      </div>
                      <div>
                        <p
                          style={{
                            wordBreak: "break-word",
                          }}
                          className="text-theme-sm font-medium text-gray-800 dark:text-white/90"
                        >
                          {order.items?.[0]?.itemId?.nameAr ?? "اسم المنتج"}
                        </p>
                        <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                          الكمية: {order.items?.[0]?.quantity ?? 1}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-theme-sm py-3 text-gray-500 dark:text-gray-400">
                    {order.userId?.mobile ?? "-"}
                  </TableCell>
                  <TableCell className="text-theme-sm py-3 text-gray-500 dark:text-gray-400">
                    {order.shopId?.name ?? "-"}
                  </TableCell>
                  <TableCell className="text-theme-sm py-3 text-gray-500 dark:text-gray-400">
                    {order.sumAmount?.toLocaleString() ?? "-"} ج.م
                  </TableCell>
                  <TableCell className="text-theme-sm py-3 text-gray-500 dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        order.orderStatus === "completed" ||
                        order.orderStatus === "shipped"
                          ? "success"
                          : order.orderStatus === "processing" ||
                              order.orderStatus === "pending"
                            ? "warning"
                            : order.orderStatus === "cancelled"
                              ? "error"
                              : "info"
                      }
                    >
                      {order.orderStatus === "completed"
                        ? "تم التوصيل"
                        : order.orderStatus === "shipped"
                          ? "تم الشحن"
                          : order.orderStatus === "processing" ||
                              order.orderStatus === "pending"
                            ? "جارِ التنفيذ"
                            : order.orderStatus === "cancelled"
                              ? "ملغاة"
                              : order.orderStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
