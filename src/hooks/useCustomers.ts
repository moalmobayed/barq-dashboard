// src/hooks/useCustomers.ts
import { useCallback, useEffect, useState } from "react";
import { Customer } from "@/types/customer";
import { fetchCustomers } from "@/lib/api/customers";

export function useCustomers(page: number, limit: number) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, pages } = await fetchCustomers(page, limit);
      setCustomers(data);
      setTotalPages(pages);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return { customers, loading, totalPages, refetch: loadCustomers };
}
