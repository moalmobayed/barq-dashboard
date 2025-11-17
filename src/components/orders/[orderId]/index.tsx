"use client";

import Button from "@/components/ui/button/Button";
import { useOrder } from "@/hooks/useOrders";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CiLocationOn, CiPhone } from "react-icons/ci";
import { BASE_URL } from "@/lib/config";
import Badge from "@/components/ui/badge/Badge";
import { MdPersonOutline } from "react-icons/md";
import { updateOrder } from "@/lib/api/orders";
import { fetchAgents } from "@/lib/api/agents";
import { Agent } from "@/types/agent";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";
import { ChevronDownIcon } from "../../../../public/icons";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { AxiosError } from "axios";

export default function OrderDetailsComponent() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { order, loading, error, refetch } = useOrder(orderId);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<AlertProps | null>(null);

  // Load agents on mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await fetchAgents(1, 1000);
        setAgents(response.data);
      } catch (err) {
        console.error("Failed to fetch agents:", err);
      }
    };
    loadAgents();
  }, []);

  // Set initial values when order loads
  useEffect(() => {
    if (order) {
      setSelectedAgent(order.deliveryAgent?._id || "");
      setSelectedStatus(order.orderStatus || "");
    }
  }, [order]);

  useEffect(() => {
    const socket = io(BASE_URL);
    socket.on("update:order", (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        refetch();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [orderId, refetch]);

  const handleUpdateOrder = async () => {
    setIsUpdating(true);
    try {
      const updateData: {
        deliveryAgent?: string;
        orderStatus?:
          | "pending"
          | "processing"
          | "completed"
          | "cancelled"
          | "shipped";
      } = {};

      if (selectedAgent && selectedAgent !== order?.deliveryAgent?._id) {
        updateData.deliveryAgent = selectedAgent;
      }

      if (selectedStatus && selectedStatus !== order?.orderStatus) {
        updateData.orderStatus = selectedStatus as
          | "pending"
          | "processing"
          | "completed"
          | "cancelled"
          | "shipped";
      }

      if (Object.keys(updateData).length === 0) {
        setToast({
          variant: "info",
          title: "لا توجد تغييرات",
          message: "لم يتم تغيير أي بيانات",
        });
        setTimeout(() => setToast(null), 5000);
        setIsUpdating(false);
        return;
      }

      await updateOrder(orderId, updateData);
      setToast({
        variant: "success",
        title: "تم التحديث بنجاح",
        message: "تم تحديث بيانات الطلب بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      refetch();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في التحديث",
          message:
            err.response?.data?.message ||
            "فشل في تحديث الطلب. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to update order:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const coords = order?.deliveryAddress?.location;
  const mapUrl = coords
    ? `https://www.google.com/maps?q=${coords[0]},${coords[1]}`
    : undefined;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="border-brand-500 mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-600 dark:text-gray-400">
          {error ? "فشل تحميل الطلب" : "لم يتم العثور على الطلب"}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/orders")}
        >
          العودة
        </Button>
      </div>
    );
  }

  // Layout
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-3">
      <div className="col-span-full flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            طلب رقم {order.orderNumber || "-"}
          </h1>
        </div>
        <Button size="sm" onClick={() => router.push("/orders")}>
          رجوع
        </Button>
      </div>

      {/* ملخص الطلب */}
      <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/[0.05]">
        <div className="mb-2 flex justify-between gap-2 font-bold text-gray-800 dark:text-white">
          ملخص الطلب
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
                : order.orderStatus === "pending" ||
                    order.orderStatus === "processing"
                  ? "جارِ التنفيذ"
                  : order.orderStatus === "cancelled"
                    ? "ملغاة"
                    : order.orderStatus}
          </Badge>
        </div>

        <div className="flex flex-col gap-1 divide-y-2 text-sm dark:text-white/90">
          <div className="flex justify-between py-2 dark:border-white/10">
            <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
              رقم الطلب
            </span>
            <span className="font-medium text-gray-700 dark:text-white/90">
              #{order.orderNumber || "-"}
            </span>
          </div>
          <div className="flex justify-between py-2 dark:border-white/10">
            <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
              الإجمالي
            </span>
            <span className="font-bold text-gray-800 dark:text-white/90">
              {order.sumAmount?.toLocaleString() || "-"} ج.م
            </span>
          </div>
          <div className="flex justify-between py-2 dark:border-white/10">
            <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
              تاريخ الطلب
            </span>
            <span className="font-medium text-gray-700 dark:text-white/90">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : "-"}
            </span>
          </div>
          <div className="flex justify-between py-2 dark:border-white/10">
            <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
              طريقة الدفع
            </span>
            <span className="font-medium text-gray-700 dark:text-white/90">
              {order.paymentMethod
                ? order.paymentMethod === "cash"
                  ? "نقداً"
                  : "بطاقة"
                : "-"}
            </span>
          </div>
          <div className="flex justify-between py-2 dark:border-white/10">
            <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
              حالة الدفع
            </span>
            <span className="font-medium text-gray-700 dark:text-white/90">
              {order.paymentStatus
                ? order.paymentStatus === "paid"
                  ? "تم الدفع"
                  : order.paymentStatus === "pending"
                    ? "معلق"
                    : "فشل"
                : "-"}
            </span>
          </div>

          {/* Review Section */}
          {order.review && (
            <div className="flex flex-col gap-3 py-2 dark:border-white/10">
              <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
                تقييم العميل
              </span>

              {/* Rating Stars */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-4 w-4 ${
                        star <= (order.review?.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  ({order.review?.rating || 0}/5)
                </span>
              </div>

              {/* Review Content */}
              {order.review?.content && (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-white/5">
                  <p className="text-xs text-gray-700 dark:text-white/90">
                    {order.review.content}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* تفاصيل المتجر */}
      <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/[0.05]">
        <div className="mb-2 font-bold text-gray-800 dark:text-white">
          تفاصيل المتجر
        </div>
        <div className="mb-2 flex items-center gap-2">
          <Image
            src={order.shopId?.profileImage || "/images/logo/barq-logo.png"}
            alt="اسم المتجر"
            width={32}
            height={32}
            className="size-10 rounded-full"
          />
          <span className="font-medium text-gray-700 dark:text-white/90">
            {order.shopId?.name ?? "-"}
          </span>
        </div>
        <div className="flex flex-col gap-1 divide-y-2 text-sm">
          <div className="flex flex-col justify-between gap-2 py-2 dark:border-white/10">
            <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
              رقم الهاتف
            </span>
            <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-white/90">
              <CiPhone className="text-xl text-blue-600" />
              <span className="dark:text-white/90">
                {order.shopId?.mobile ?? "-"}
              </span>
            </span>
          </div>
          <div className="flex flex-col justify-between gap-2 py-2 dark:border-white/10">
            <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
              عنوان المتجر
            </span>
            <span className="flex gap-2 font-medium text-gray-700 dark:text-white/90">
              <CiLocationOn className="flex-shrink-0 text-xl text-blue-600" />
              <span className="dark:text-white/90">
                {order.shopId?.location ?? "-"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* معلومات العميل */}
      <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/[0.05]">
        <div className="mb-2 font-bold text-gray-800 dark:text-white">
          معلومات العميل
        </div>
        <div className="mb-2">
          <div className="flex h-16 w-full items-center justify-center rounded-lg bg-[url('/images/country/map-placeholder.png')]">
            <Link
              href={mapUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-4xl bg-black/10 p-2 text-xs text-blue-900 backdrop-blur-xs transition-all duration-500 hover:underline hover:backdrop-blur-lg"
            >
              <CiLocationOn className="flex items-center gap-1 text-xl" />
              عرض على الخريطة
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-1 divide-y-2 text-sm">
          <div className="flex flex-col justify-between gap-2 py-2 dark:border-white/10">
            <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
              اسم العميل
            </span>
            <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-white/90">
              <MdPersonOutline className="text-xl text-blue-600" />
              <span className="dark:text-white/90">
                {order.userId?.name ?? "-"}
              </span>
            </span>
          </div>
          <div className="flex flex-col justify-between gap-2 py-2 dark:border-white/10">
            <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
              رقم الهاتف
            </span>
            <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-white/90">
              <CiPhone className="text-xl text-blue-600" />
              <span className="dark:text-white/90">
                {order.userId?.mobile ?? "-"}
              </span>
            </span>
          </div>
          <div className="flex flex-col justify-between gap-2 py-2 dark:border-white/10">
            <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
              عنوان العميل
            </span>
            <span className="flex gap-2 font-medium text-balance text-gray-700 dark:text-white/90">
              <CiLocationOn className="flex-shrink-0 text-xl text-blue-600" />
              <span className="max-w-full text-balance break-words break-all whitespace-normal dark:text-white/90">
                {order.deliveryAddress?.fullAddress ?? "-"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* تفاصيل الطلب */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 lg:col-span-2 dark:border-white/10 dark:bg-white/[0.05]">
        <div className="mb-4 font-bold text-gray-800 dark:text-white">
          تفاصيل الطلب
        </div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-2">
              {order.items?.length ? (
                order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border-2 p-2 dark:border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={item.itemId?.image || "/images/logo/barq-logo.png"}
                        alt={item.itemId?.nameAr || "منتج"}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                      <div>
                        <div
                          style={{
                            wordBreak: "break-word",
                          }}
                          className="text-sm font-medium dark:text-white/90"
                        >
                          {item.itemId?.nameAr ?? "اسم المنتج"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">
                          الكمية: {item.quantity ?? 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-brand-blue text-sm font-bold">
                      <span className="dark:text-white/90">
                        {item.price?.toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">لا توجد منتجات</div>
              )}
            </div>
          </div>

          {/* تفاصيل التوصيل breakdown */}
          <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
            <div className="mb-2 font-bold text-gray-800 dark:text-white">
              تفاصيل التوصيل
            </div>
            <div className="flex flex-col gap-1 divide-y-2 text-sm">
              <div className="flex justify-between py-2 dark:border-white/10">
                <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
                  عدد المنتجات
                </span>
                <span className="font-bold">
                  <span className="dark:text-white/90">
                    {order.items?.length ?? 0} منتجات
                  </span>
                </span>
              </div>
              <div className="flex justify-between py-2 dark:border-white/10">
                <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
                  السعر
                </span>
                <span className="font-bold">
                  <span className="dark:text-white/90">
                    {order.totalAmount?.toLocaleString()} ج.م
                  </span>
                </span>
              </div>
              <div className="flex justify-between py-2 dark:border-white/10">
                <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
                  رسوم التوصيل
                </span>
                <span className="font-bold">
                  <span className="dark:text-white/90">
                    {order.deliveryFee?.toLocaleString()} ج.م
                  </span>
                </span>
              </div>
              <div className="flex justify-between py-2 dark:border-white/10">
                <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
                  الخصم
                </span>
                <span className="font-bold text-red-600">
                  <span className="dark:text-red-400">
                    {order.totalDiscount?.toLocaleString()} ج.م
                  </span>
                </span>
              </div>
              <div className="flex justify-between py-2 font-bold dark:border-white/10">
                <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
                  الإجمالي
                </span>
                <span className="font-bold">
                  <span className="dark:text-white/90">
                    {order.sumAmount?.toLocaleString()} ج.م
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* تفاصيل التوصيل */}
      <div className="flex h-fit flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/[0.05]">
        <div className="mb-2 font-bold text-gray-800 dark:text-white">
          تفاصيل التوصيل
        </div>

        {/* Order Status */}
        <div>
          <Label>حالة الطلب</Label>
          <div className="relative">
            <Select
              options={[
                { value: "pending", label: "قيد الانتظار" },
                { value: "processing", label: "جاري التنفيذ" },
                { value: "shipped", label: "تم الشحن" },
                { value: "completed", label: "تم التوصيل" },
                { value: "cancelled", label: "ملغي" },
              ]}
              placeholder="اختر حالة الطلب"
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
            />
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        {/* Delivery Agent */}
        <div>
          <Label>مندوب التوصيل</Label>
          <div className="relative">
            <Select
              options={[
                ...agents.map((agent) => ({
                  value: agent._id,
                  label: agent.name,
                })),
              ]}
              placeholder="اختر مندوب التوصيل"
              value={selectedAgent}
              onChange={(val) => setSelectedAgent(val)}
            />
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        {/* Current Delivery Agent Info */}
        {order?.deliveryAgent && (
          <div className="flex flex-col gap-1 divide-y-2 rounded-lg border bg-gray-50 p-3 text-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col justify-between gap-2 py-2 dark:border-white/10">
              <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
                المندوب الحالي
              </span>
              <span className="font-medium text-gray-700 dark:text-white/90">
                <span className="dark:text-white/90">
                  {order.deliveryAgent?.name ?? "-"}
                </span>
              </span>
            </div>
            <div className="flex flex-col justify-between gap-2 py-2 dark:border-white/10">
              <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
                رقم المندوب
              </span>
              <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-white/90">
                {order.deliveryAgent?.mobile && (
                  <CiPhone className="text-xl text-blue-600" />
                )}
                <span className="dark:text-white/90">
                  {order.deliveryAgent?.mobile ?? "-"}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Update Button */}
        <Button
          size="sm"
          onClick={handleUpdateOrder}
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating && (
            <svg
              className="h-4 w-4 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          تحديث الطلب
        </Button>
      </div>

      {/* ملاحظات العميل */}
      {/* <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 dark:border-white/10  bg-white p-4 ">
        <div className="mb-2 font-bold text-gray-800">ملاحظات العميل</div>
        <div className="min-h-[48px] text-xs text-gray-500">
          لا توجد أي ملاحظات
        </div>
      </div> */}

      {toast && (
        <div className="fixed end-4 top-4 z-[9999] max-w-sm">
          <Alert {...toast} />
        </div>
      )}
    </div>
  );
}
