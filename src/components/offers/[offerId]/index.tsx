"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { getSingleOffer } from "@/lib/api/offers";
import { Offer } from "@/types/offer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
  EditOfferButton,
  DeleteOfferButton,
} from "@/components/offers/OffersModals";
import InfoCard from "@/components/shared/InfoCard";

export default function OfferDetailsComponent() {
  const { offerId } = useParams<{ offerId: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId) return;
    const fetchOffer = async () => {
      try {
        const data = await getSingleOffer(offerId);
        setOffer(data);
      } catch {
        setError("فشل تحميل بيانات العرض");
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [offerId]);

  // Move useMemo and derived computations before any early returns
  const discount = offer?.discount || 0;
  const productPrice = offer?.product?.price ?? 0;
  const discountedPrice = useMemo(
    () =>
      discount > 0
        ? Math.max(0, productPrice - (productPrice * discount) / 100)
        : productPrice,
    [discount, productPrice],
  );

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

  if (error || !offer) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-600 dark:text-gray-400">
          {error || "لم يتم العثور على العرض"}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/offers")}
        >
          العودة
        </Button>
      </div>
    );
  }

  // Derived computations
  const now = Date.now();
  const start = new Date(offer.startDate as unknown as string).getTime();
  const end = new Date(offer.endDate as unknown as string).getTime();
  const isUpcoming = start && start > now;
  const isExpired = end && end < now;
  const activeDerived = offer.isActive ?? (!isUpcoming && !isExpired);
  const remainingMs = end - now;
  const remainingDays =
    remainingMs > 0 ? Math.ceil(remainingMs / (1000 * 60 * 60 * 24)) : 0;

  const formatDate = (d: unknown) => {
    if (!d) return "-";
    const dt = new Date(d as string | number | Date);
    if (isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusBadge = (() => {
    if (isUpcoming)
      return (
        <Badge size="sm" color="warning" variant="light">
          قادم
        </Badge>
      );
    if (isExpired)
      return (
        <Badge size="sm" color="error" variant="light">
          منتهي
        </Badge>
      );
    return (
      <Badge
        size="sm"
        color={activeDerived ? "success" : "error"}
        variant="light"
      >
        {activeDerived ? "نشط" : "غير نشط"}
      </Badge>
    );
  })();

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {offer.name}
            </h1>
          </div>
          <Button size="sm" onClick={() => router.push("/offers")}>
            رجوع
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left / main content */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2 dark:border-white/10 dark:bg-white/[0.05]">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="w-full max-w-[220px] self-start">
                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                  <Image
                    width={400}
                    height={300}
                    src={offer.image || "/images/logo/barq-logo.png"}
                    alt={offer.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="absolute start-2 top-2 flex gap-2">
                    {statusBadge}
                    {discount > 0 && (
                      <Badge size="sm" variant="solid">
                        {discount.toFixed(2)}% خصم
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-3 text-xs dark:bg-white/5">
                  <InfoRow
                    label="تاريخ البدء"
                    value={formatDate(offer.startDate)}
                  />
                  <InfoRow
                    label="تاريخ الانتهاء"
                    value={formatDate(offer.endDate)}
                  />
                  <InfoRow
                    label="الحالة"
                    value={
                      isUpcoming
                        ? "قادم"
                        : isExpired
                          ? "منتهي"
                          : activeDerived
                            ? "نشط"
                            : "غير نشط"
                    }
                  />
                  <InfoRow
                    label="متبقي"
                    value={
                      isExpired
                        ? "0 يوم"
                        : isUpcoming
                          ? "—"
                          : `${remainingDays} يوم`
                    }
                  />
                </div>
              </div>

              <div className="flex-1 space-y-8">
                {/* Offer basic info */}
                <section>
                  <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    تفاصيل العرض
                  </h2>
                  <p className="mb-4 text-sm leading-6 whitespace-pre-line text-gray-700 dark:text-gray-300">
                    {offer.description || "لا يوجد وصف"}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoCard
                      label="نسبة الخصم"
                      value={`${discount.toFixed(2)}%`}
                    />
                    <PriceCard
                      original={productPrice}
                      discounted={discountedPrice}
                      hasDiscount={discount > 0}
                    />
                  </div>
                </section>

                {/* Product info */}
                <section>
                  <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    المنتج
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoCard
                      label="الاسم (عربي)"
                      value={offer.product?.nameAr || "—"}
                    />
                    <InfoCard
                      label="الاسم (إنجليزي)"
                      value={offer.product?.nameEn || "—"}
                    />
                    <InfoCard
                      label="السعر الأساسي"
                      value={`${offer.product?.price.toFixed(2) ?? 0} ج.م`}
                    />
                    <InfoCard
                      label="التقييم"
                      value={`${offer.product?.rating ?? 0} ⭐`}
                    />
                  </div>
                </section>

                {/* Vendor info */}
                <section>
                  <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    التاجر
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoCard
                      label="اسم المتجر"
                      value={offer.shopId?.name || "—"}
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Right / actions & meta */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.05]">
              <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                الحالة
              </h3>
              <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">{statusBadge}</div>
                <InfoRow label="البدء" value={formatDate(offer.startDate)} />
                <InfoRow label="الانتهاء" value={formatDate(offer.endDate)} />
                <InfoRow
                  label="متبقي"
                  value={
                    isExpired
                      ? "0 يوم"
                      : isUpcoming
                        ? "—"
                        : `${remainingDays} يوم`
                  }
                />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.05]">
              <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                الإجراءات
              </h3>
              <div className="flex flex-wrap gap-4">
                <EditOfferButton
                  offer={offer}
                  onSuccess={async () => {
                    try {
                      const data = await getSingleOffer(offerId);
                      setOffer(data);
                    } catch {
                      /* ignore */
                    }
                  }}
                />
                <DeleteOfferButton
                  offerId={offer._id}
                  onSuccess={() => router.push("/offers")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
// Small helper components

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="hover:border-brand-500 hover:bg-brand-500/5 hover:dark:border-brand-400 flex items-center justify-between gap-4 rounded-md bg-white/60 px-3 py-2 text-xs transition-all dark:bg-white/10">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-white/90">
        {value}
      </span>
    </div>
  );
}

function PriceCard({
  original,
  discounted,
  hasDiscount,
}: {
  original: number;
  discounted: number;
  hasDiscount: boolean;
}) {
  return (
    <div
      className={`hover:border-brand-500 hover:bg-brand-500/5 hover:dark:border-brand-400 rounded-md border border-gray-200 px-3 py-2 text-sm transition-all duration-200 dark:border-white/10`}
    >
      <span className="block text-[11px] font-medium tracking-wide text-gray-500 dark:text-gray-400">
        السعر
      </span>
      <div className="mt-0.5 flex flex-wrap items-baseline gap-3">
        <span
          className={`text-[13px] font-medium text-gray-500 line-through dark:text-gray-400 ${!hasDiscount ? "opacity-50" : ""}`}
        >
          {original.toFixed(2)} ج.م
        </span>
        {hasDiscount && (
          <span className="text-brand-600 dark:text-brand-300 text-base font-semibold">
            {discounted.toFixed(2)} ج.م
          </span>
        )}
        {!hasDiscount && (
          <span className="text-base font-semibold text-gray-800 dark:text-white/90">
            {original.toFixed(2)} ج.م
          </span>
        )}
      </div>
    </div>
  );
}
