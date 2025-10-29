"use client";

import Button from "@/components/ui/button/Button";
import { useOrder } from "@/hooks/useOrders";
import { useEffect } from "react";
import io from "socket.io-client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CiLocationOn, CiPhone } from "react-icons/ci";
import { BASE_URL } from "@/lib/config";
import Badge from "@/components/ui/badge/Badge";
import { MdPersonOutline } from "react-icons/md";

export default function OrderDetailsComponent() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { order, loading, error, refetch } = useOrder(orderId);

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
                : order.orderStatus === "pending"
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
                        <div className="text-sm font-medium dark:text-white/90">
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
      {order.deliveryAgent && (
        <div className="flex h-fit flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mb-2 font-bold text-gray-800 dark:text-white">
            تفاصيل التوصيل
          </div>
          <div className="flex flex-col gap-1 divide-y-2 text-sm">
            <div className="flex flex-col justify-between gap-2 py-2 dark:border-white/10">
              <span className="block font-medium tracking-wide text-gray-500 dark:text-gray-400">
                اسم المندوب
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
        </div>
      )}

      {/* ملاحظات العميل */}
      {/* <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 dark:border-white/10  bg-white p-4 ">
        <div className="mb-2 font-bold text-gray-800">ملاحظات العميل</div>
        <div className="min-h-[48px] text-xs text-gray-500">
          لا توجد أي ملاحظات
        </div>
      </div> */}
    </div>
  );
}
