// src/hooks/useTowns.ts
import { useCallback, useEffect, useState } from "react";
import { Town } from "@/types/town";
import { fetchTowns } from "@/lib/api/towns";

export function useTowns(page: number, limit: number) {
  const [towns, setTowns] = useState<Town[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const loadTowns = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchTowns(); // get full data

      const calculatedPages = Math.ceil(data.length / limit);
      setTotalPages(calculatedPages);

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = data.slice(start, end);

      setTowns(paginatedData);
    } catch (error) {
      console.error("Error fetching towns:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadTowns();
  }, [loadTowns]);

  return { towns, loading, totalPages, refetch: loadTowns };
}
