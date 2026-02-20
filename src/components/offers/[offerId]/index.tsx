"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getSingleOffer,
  getSinglePackageOffer,
  getSingleDeliveryOffer,
} from "@/lib/api/offers";
import { Offer, OfferType } from "@/types/offer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
  EditOfferButton,
  DeleteOfferButton,
} from "@/components/offers/OffersModals";
import InfoCard from "@/components/shared/InfoCard";
import { MdLocalOffer } from "react-icons/md";

/** Get the right API function for the offer type */
function fetchOfferByType(id: string, type: OfferType) {
  switch (type) {
    case "package":
      return getSinglePackageOffer(id);
    case "delivery":
      return getSingleDeliveryOffer(id);
    case "single":
    default:
      return getSingleOffer(id);
  }
}

/** Get vendor name safely */
function getVendorName(offer: Offer): string {
  if (!offer.shopId) return "—";
  if (typeof offer.shopId === "string") return offer.shopId;
  return offer.shopId.name || "—";
}

/** Get vendor image safely */
function getVendorImage(offer: Offer): string | null {
  if (!offer.shopId || typeof offer.shopId === "string") return null;
  return offer.shopId.profileImage || null;
}

/** Offer type badge label + color */
function getTypeBadge(type: OfferType): {
  label: string;
  color: "info" | "warning" | "success";
} {
  switch (type) {
    case "package":
      return { label: "حزمة مركبة", color: "warning" };
    case "delivery":
      return { label: "عرض توصيل", color: "success" };
    case "single":
    default:
      return { label: "منتج واحد", color: "info" };
  }
}

export default function OfferDetailsComponent() {
  const { offerId } = useParams<{ offerId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const offerType = (searchParams.get("type") as OfferType) || "single";

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId) return;
    const fetchOffer = async () => {
      setLoading(true);
      try {
        const data = await fetchOfferByType(offerId, offerType);
        setOffer({ ...data, offerType });
      } catch {
        setError("فشل تحميل بيانات العرض");
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [offerId, offerType]);

  // Derived computations
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

  // Date computations
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

  const typeBadge = getTypeBadge(offerType);

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div>
              <h1
                style={{ wordBreak: "break-word" }}
                className="text-2xl font-semibold text-gray-800 dark:text-white/90"
              >
                {offer.nameAr ||
                  offer.nameEn ||
                  (offerType === "delivery" ? "عرض توصيل" : "بدون اسم")}
              </h1>
              <div className="mt-1">
                <Badge size="sm" color={typeBadge.color} variant="light">
                  {typeBadge.label}
                </Badge>
              </div>
            </div>
          </div>
          <Button size="sm" onClick={() => router.push("/offers")}>
            رجوع
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left / main content */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2 dark:border-white/10 dark:bg-white/[0.05]">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Image / badge column */}
              <div className="w-full max-w-[220px] self-start">
                <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                  {offer.image ? (
                    <Image
                      width={400}
                      height={300}
                      src={offer.image}
                      alt={offer.nameAr || offer.nameEn || "عرض"}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <MdLocalOffer className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute start-2 top-2 flex gap-2">
                    {statusBadge}
                    {discount > 0 && (
                      <Badge size="sm" variant="solid">
                        {discount}% خصم
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

              {/* Details column */}
              <div className="flex-1 space-y-8">
                {/* Offer basic info */}
                <section>
                  <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    تفاصيل العرض
                  </h2>
                  <p
                    style={{ wordBreak: "break-word" }}
                    className="mb-4 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300"
                  >
                    {offer.descriptionAr || "لا يوجد وصف"}
                  </p>

                  {/* Type-specific info cards */}
                  {offerType === "single" && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoCard label="نسبة الخصم" value={`${discount}%`} />
                      <PriceCard
                        original={productPrice}
                        discounted={discountedPrice}
                        hasDiscount={discount > 0}
                      />
                    </div>
                  )}

                  {offerType === "package" && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoCard
                        label="سعر الحزمة"
                        value={`${offer.price?.toFixed(2) ?? 0} ج.م`}
                        highlight
                      />
                      <InfoCard
                        label="عدد المنتجات"
                        value={`${offer.products?.length ?? 0} منتج`}
                      />
                    </div>
                  )}

                  {offerType === "delivery" && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoCard
                        label="خصم التوصيل"
                        value={`${discount}%`}
                        highlight
                      />
                    </div>
                  )}
                </section>

                {/* Single product: product info */}
                {offerType === "single" && offer.product && (
                  <section>
                    <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                      المنتج
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <InfoCard
                        label="الاسم (عربي)"
                        value={offer.product.nameAr || "—"}
                      />
                      <InfoCard
                        label="الاسم (إنجليزي)"
                        value={offer.product.nameEn || "—"}
                      />
                      <InfoCard
                        label="السعر الأساسي"
                        value={`${offer.product.price?.toFixed(2) ?? 0} ج.م`}
                      />
                      <InfoCard
                        label="التقييم"
                        value={`${offer.product.rating ?? 0} ⭐`}
                      />
                    </div>
                  </section>
                )}

                {/* Package: products list */}
                {offerType === "package" &&
                  offer.products &&
                  offer.products.length > 0 && (
                    <section>
                      <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
                        منتجات الحزمة ({offer.products.length})
                      </h2>
                      <div className="space-y-3">
                        {offer.products.map((prod) => (
                          <div
                            key={prod._id}
                            className="hover:border-brand-500 hover:bg-brand-blue/5 dark:hover:border-brand-400 flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-all dark:border-white/10"
                          >
                            <Image
                              width={48}
                              height={48}
                              src={prod.image || "/images/logo/barq-logo.png"}
                              alt={prod.nameAr}
                              className="size-12 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                                {prod.nameAr}
                              </p>
                              {prod.descriptionAr && (
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                  {prod.descriptionAr.length > 60
                                    ? prod.descriptionAr.slice(0, 60) + "..."
                                    : prod.descriptionAr}
                                </p>
                              )}
                            </div>
                            <div className="text-end">
                              <span className="text-brand-600 dark:text-brand-300 text-sm font-semibold">
                                {prod.price?.toFixed(2)} ج.م
                              </span>
                              {prod.category && (
                                <p className="text-[10px] text-gray-400">
                                  {prod.category.nameAr}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {/* Total price summary */}
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-white/5">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            إجمالي أسعار المنتجات
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {offer.products
                              .reduce((sum, p) => sum + (p.price || 0), 0)
                              .toFixed(2)}{" "}
                            ج.م
                          </span>
                        </div>
                        <div className="bg-brand-blue/5 dark:bg-brand-500/10 flex items-center justify-between rounded-lg px-4 py-3">
                          <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                            سعر الحزمة
                          </span>
                          <span className="text-brand-600 dark:text-brand-300 text-lg font-bold">
                            {offer.price?.toFixed(2)} ج.م
                          </span>
                        </div>
                      </div>
                    </section>
                  )}

                {/* Vendor info */}
                <section>
                  <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                    التاجر
                  </h2>
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-white/10">
                    {getVendorImage(offer) ? (
                      <Image
                        width={40}
                        height={40}
                        src={getVendorImage(offer)!}
                        alt={getVendorName(offer)}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <span className="text-sm font-bold text-gray-400">
                          {getVendorName(offer).charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {getVendorName(offer)}
                    </span>
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
                      const data = await fetchOfferByType(offerId, offerType);
                      setOffer({ ...data, offerType });
                    } catch {
                      /* ignore */
                    }
                  }}
                />
                <DeleteOfferButton
                  offerId={offer._id}
                  offerType={offer.offerType}
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
    <div className="hover:border-brand-500 hover:bg-brand-blue/5 hover:dark:border-brand-400 flex items-center justify-between gap-4 rounded-md bg-white/60 px-3 py-2 text-xs transition-all dark:bg-white/10">
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
      className={`hover:border-brand-500 hover:bg-brand-blue/5 hover:dark:border-brand-400 rounded-md border border-gray-200 px-3 py-2 text-sm transition-all duration-200 dark:border-white/10`}
    >
      <span className="block text-[11px] font-medium tracking-wide text-gray-500 dark:text-gray-400">
        السعر
      </span>
      <div className="mt-0.5 flex flex-wrap items-baseline gap-3">
        <span
          style={{
            wordBreak: "break-word",
          }}
          className={`text-[13px] font-medium text-gray-500 line-through dark:text-gray-400 ${!hasDiscount ? "opacity-50" : ""}`}
        >
          {original.toFixed(2)} ج.م
        </span>
        {hasDiscount && (
          <span
            style={{
              wordBreak: "break-word",
            }}
            className="text-brand-600 dark:text-brand-300 text-base font-semibold"
          >
            {discounted.toFixed(2)} ج.م
          </span>
        )}
        {!hasDiscount && (
          <span
            style={{
              wordBreak: "break-word",
            }}
            className="text-base font-semibold text-gray-800 dark:text-white/90"
          >
            {original.toFixed(2)} ج.م
          </span>
        )}
      </div>
    </div>
  );
}
