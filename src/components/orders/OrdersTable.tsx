// src/components/orders/OrdersTable.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "../tables/Pagination";
import { FaEye } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { getOrderSummary } from "@/lib/api/dashboard";
import io from "socket.io-client";
import { getAuthToken } from "@/lib/api/auth";
import { MdShoppingCart } from "react-icons/md";
import DatePicker from "../form/date-picker";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const limits = [5, 10, 20, 50];

export default function OrdersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [shopId, setShopId] = useState("");
  const [userId, setUserId] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit, setTableLimit] = useState(10);

  interface SummaryOrder {
    _id: string;
    orderStatus: string;
    orderNumber: string;
    createdAt: string;
    deliveryAgent?: {
      _id: string;
      name: string;
      mobile: string;
    };
    vendor: {
      _id: string;
      name: string;
      mobile: string;
      profileImage?: string;
    };
    user: {
      _id: string;
      name: string;
      mobile: string;
    };
    total: number;
    delivery: number;
    totalWithDelivery: number;
    agentEarn: number;
    vendorEarn: number;
    barqEarnFromVendor: number;
    barqEarnFromDelivery: number;
  }

  interface SummaryMetadata {
    summary: {
      total: number;
      delivery: number;
      totalWithDelivery: number;
      agentEarn: number;
      vendorEarn: number;
      barqEarnFromVendor: number;
      barqEarnFromDelivery: number;
    };
    data: SummaryOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }

  const [summaryData, setSummaryData] = useState<SummaryMetadata | null>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = await getOrderSummary({
        page: tablePage,
        limit: tableLimit,
        vendorName: searchTerm || undefined,
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        shopId: shopId || undefined,
        userId: userId || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      });
      setSummaryData(res);
    } catch (error) {
      console.error("Error fetching order summary:", error);
    } finally {
      setTableLoading(false);
    }
  }, [
    tablePage,
    tableLimit,
    searchTerm,
    orderStatus,
    paymentStatus,
    shopId,
    userId,
    fromDate,
    toDate,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    const token = getAuthToken();
    const socketUrl =
      process.env.NODE_ENV === "production"
        ? "https://api.barqshipping.com"
        : "http://api.barqshipping.com:4000";

    const socket = io(socketUrl, {
      path: "/socket.io/",
      transportOptions: {
        polling: {
          extraHeaders: { Authorization: `Bearer ${token}` },
        },
      },
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
    });

    socket.on("new:order", () => fetchSummary());
    socket.on("update:order", () => fetchSummary());

    return () => {
      socket.disconnect();
    };
  }, [fetchSummary]);

  const orders = summaryData?.data || [];
  const effectiveTotalPages = summaryData?.pagination?.totalPages || 0;

  return (
    <div className="max-w-full space-y-4 overflow-x-hidden">
      <div className="flex max-w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex max-w-full flex-wrap items-center gap-4 overflow-x-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setTablePage(1);
            }}
            placeholder="البحث باسم المتجر..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:outline-hidden sm:max-w-sm dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
          />

          <input
            type="text"
            value={shopId}
            onChange={(e) => {
              setShopId(e.target.value);
              setTablePage(1);
            }}
            placeholder="معرف المتجر..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:outline-hidden sm:max-w-[150px] dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
          />

          <input
            type="text"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setTablePage(1);
            }}
            placeholder="معرف المستخدم..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:outline-hidden sm:max-w-[150px] dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
          />

          <div className="w-full sm:max-w-[150px]">
            <DatePicker
              id="fromDate"
              placeholder="من تاريخ"
              onChange={(dates) => {
                setFromDate(dates[0]?.toISOString() || "");
                setTablePage(1);
              }}
            />
          </div>

          <div className="w-full sm:max-w-[150px]">
            <DatePicker
              id="toDate"
              placeholder="إلى تاريخ"
              onChange={(dates) => {
                setToDate(dates[0]?.toISOString() || "");
                setTablePage(1);
              }}
            />
          </div>

          <select
            value={orderStatus}
            onChange={(e) => {
              setOrderStatus(e.target.value);
              setTablePage(1);
            }}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <option value="">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="processing">جارِ التنفيذ</option>
            <option value="shipped">تم الشحن</option>
            <option value="completed">تم التوصيل</option>
            <option value="cancelled">ملغاة</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setTablePage(1);
            }}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <option value="">حالة الدفع</option>
            <option value="pending">قيد الانتظار</option>
            <option value="paid">تم الدفع</option>
            <option value="failed">فشل الدفع</option>
          </select>

          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split(":");
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
              setTablePage(1);
            }}
            className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <option value="createdAt:desc">الأحدث أولاً</option>
            <option value="createdAt:asc">الأقدم أولاً</option>
            <option value="sumAmount:desc">الأعلى قيمة</option>
            <option value="sumAmount:asc">الأقل قيمة</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <label className="text-sm text-gray-600 dark:text-white/70">
          صف في الصفحة:
        </label>
        <select
          value={tableLimit}
          onChange={(e) => {
            setTableLimit(Number(e.target.value));
            setTablePage(1);
          }}
          className="rounded-md border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-700"
        >
          {limits.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>رقم الطلب</TableCell>
                <TableCell isHeader>المستخدم</TableCell>
                <TableCell isHeader>المتجر</TableCell>
                <TableCell isHeader>المندوب</TableCell>
                <TableCell isHeader>الإجمالي</TableCell>
                <TableCell isHeader>التوصيل</TableCell>
                <TableCell isHeader className="text-indigo-600">
                  إجمالي شامل
                </TableCell>
                <TableCell isHeader>ربح المندوب</TableCell>
                <TableCell isHeader>ربح المتجر</TableCell>
                <TableCell isHeader>عمولة برق (متجر)</TableCell>
                <TableCell isHeader>عمولة برق (توصيل)</TableCell>
                <TableCell isHeader>حالة الطلب</TableCell>
                <TableCell isHeader>التاريخ</TableCell>
                <TableCell isHeader>إجراءات</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-x-scroll">
              {tableLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    {Array.from({ length: 14 }).map((__, cidx) => (
                      <TableCell key={cidx}>
                        <Skeleton height={16} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow className="overflow-x-scroll">
                  <td
                    colSpan={14}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <MdShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                      <p className="font text-sm">لا توجد طلبات</p>
                    </div>
                  </td>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id} className="overflow-x-scroll">
                    <TableCell>
                      <Link
                        href={`/orders/${order._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{order.user?.mobile}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Image
                          src={
                            order.vendor?.profileImage ||
                            "/images/logo/barq-logorder.png"
                          }
                          alt="vendor"
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="text-xs">
                          <p>{order.vendor?.name}</p>
                          <p className="text-gray-500">
                            {order.vendor?.mobile}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{order.deliveryAgent?.name || "-"}</TableCell>
                    <TableCell>{order.total?.toLocaleString()} ج.م</TableCell>
                    <TableCell>
                      {order.delivery?.toLocaleString()} ج.م
                    </TableCell>
                    <TableCell className="font-semibold text-indigo-600">
                      {order.totalWithDelivery?.toLocaleString()} ج.م
                    </TableCell>
                    <TableCell>
                      {order.agentEarn?.toLocaleString()} ج.م
                    </TableCell>
                    <TableCell>
                      {order.vendorEarn?.toLocaleString()} ج.م
                    </TableCell>
                    <TableCell className="text-indigo-500">
                      {order.barqEarnFromVendor?.toLocaleString()} ج.م
                    </TableCell>
                    <TableCell className="text-indigo-500">
                      {order.barqEarnFromDelivery?.toLocaleString()} ج.م
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        color={
                          order.orderStatus === "completed"
                            ? "success"
                            : order.orderStatus === "cancelled"
                              ? "error"
                              : "warning"
                        }
                      >
                        {order.orderStatus === "pending"
                          ? "قيد الانتظار"
                          : order.orderStatus === "processing"
                            ? "جارِ التنفيذ"
                            : order.orderStatus === "shipped"
                              ? "تم الشحن"
                              : order.orderStatus === "completed"
                                ? "تم التوصيل"
                                : order.orderStatus === "cancelled"
                                  ? "ملغاة"
                                  : order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleString("ar-EG")}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/orders/${order._id}`}
                        className="text-indigo-600"
                      >
                        <FaEye />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {effectiveTotalPages > 1 && (
        <Pagination
          currentPage={tablePage}
          totalPages={effectiveTotalPages}
          onPageChange={setTablePage}
        />
      )}

      {summaryData && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div
            className="flex cursor-pointer items-center justify-between p-6"
            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
          >
            <h3 className="text-lg font-semibold">ملخص الطلبات الحسابي</h3>
            <div className="flex items-center gap-2 text-indigo-600">
              <span className="text-sm">
                {isSummaryExpanded ? "طي الملخص" : "عرض التفاصيل الحسابية"}
              </span>
              {isSummaryExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </div>
          </div>

          {isSummaryExpanded && (
            <div className="grid grid-cols-1 gap-4 p-6 pt-0 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "الإجمالي", val: summaryData.summary.total },
                { label: "التوصيل", val: summaryData.summary.delivery },
                {
                  label: "إجمالي شامل",
                  val: summaryData.summary.totalWithDelivery,
                  highlight: true,
                },
                { label: "ربح المندوب", val: summaryData.summary.agentEarn },
                { label: "ربح المتجر", val: summaryData.summary.vendorEarn },
                {
                  label: "عمولة برق (متجر)",
                  val: summaryData.summary.barqEarnFromVendor,
                  highlight: true,
                },
                {
                  label: "عمولة برق (توصيل)",
                  val: summaryData.summary.barqEarnFromDelivery,
                  highlight: true,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50"
                >
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p
                    className={`text-xl font-bold ${item.highlight ? "text-indigo-600" : ""}`}
                  >
                    {item.val?.toLocaleString()} ج.م
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
