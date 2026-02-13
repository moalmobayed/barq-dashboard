// src/hooks/useOffers.ts
import { useCallback, useEffect, useState } from "react";
import { Offer } from "@/types/offer";
import {
  fetchOffers,
  fetchDeliveryOffers,
  fetchPackageOffers,
} from "@/lib/api/offers";

export function useOffers(page: number, limit: number) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all 3 types in parallel
      const [singleRes, deliveryRes, packageRes] = await Promise.allSettled([
        fetchOffers(1, 500),
        fetchDeliveryOffers(1, 500),
        fetchPackageOffers(1, 500),
      ]);

      const singleOffers: Offer[] =
        singleRes.status === "fulfilled"
          ? singleRes.value.data.map((o) => ({
              ...o,
              offerType: "single" as const,
            }))
          : [];

      const deliveryOffers: Offer[] =
        deliveryRes.status === "fulfilled"
          ? deliveryRes.value.data.map((o) => ({
              ...o,
              offerType: "delivery" as const,
            }))
          : [];

      const packageOffers: Offer[] =
        packageRes.status === "fulfilled"
          ? packageRes.value.data.map((o) => ({
              ...o,
              offerType: "package" as const,
            }))
          : [];

      // Merge and sort by createdAt descending
      const merged = [
        ...singleOffers,
        ...deliveryOffers,
        ...packageOffers,
      ].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      // Client-side pagination
      const totalItems = merged.length;
      const pages = Math.max(1, Math.ceil(totalItems / limit));
      const startIdx = (page - 1) * limit;
      const paginated = merged.slice(startIdx, startIdx + limit);

      setOffers(paginated);
      setTotalPages(pages);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  return { offers, loading, totalPages, refetch: loadOffers };
}
