// src/hooks/useOffers.ts
import { useCallback, useEffect, useState } from "react";
import { Offer } from "@/types/offer";
import { fetchAllOffers } from "@/lib/api/offers";

export function useOffers(page: number, limit: number) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const {
        offers: regularOffers,
        deliveryOffers,
        metadata,
      } = await fetchAllOffers(page, limit);

      // Tag delivery offers with offerType if not already set
      const taggedDelivery: Offer[] = deliveryOffers.map((o) => ({
        ...o,
        offerType: o.offerType ?? ("delivery" as const),
      }));

      // Merge and sort by createdAt descending
      const merged = [...regularOffers, ...taggedDelivery].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setOffers(merged);
      setTotalPages(metadata.pages);
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
