// src/hooks/useBanners.ts
import { useCallback, useEffect, useState } from "react";
import { Banner } from "@/types/banner";
import { fetchBanners } from "@/lib/api/banners";

export function useBanners(page: number, limit: number) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchBanners(); // get full data

      const calculatedPages = Math.ceil(data.length / limit);
      setTotalPages(calculatedPages);

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = data.slice(start, end);

      setBanners(paginatedData);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  return { banners, loading, totalPages, refetch: loadBanners };
}
