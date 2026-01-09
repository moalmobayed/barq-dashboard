// src/hooks/useProducts.ts
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { fetchProducts } from "@/lib/api/products";

export function useProducts(page: number, limit: number, shop?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const { data, pages } = await fetchProducts(page, limit, shop);
        setProducts(data);
        setTotalPages(pages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, limit, shop]);

  const refetch = () => {
    // Trigger re-fetch by updating a dependency or calling loadProducts directly
    setLoading(true);
    fetchProducts(page, limit, shop)
      .then(({ data, pages }) => {
        setProducts(data);
        setTotalPages(pages);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { products, loading, totalPages, refetch };
}
