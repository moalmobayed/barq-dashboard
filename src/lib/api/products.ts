// lib/api/products.ts
import axios from "axios";
import { CreateProductPayload, Product } from "@/types/product";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export async function createProduct(payload: CreateProductPayload) {
  return axios.post(`${BASE_URL}/product`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function updateProduct(
  productId: string,
  data: Partial<CreateProductPayload>,
) {
  const response = await axios.put(`${BASE_URL}/product/${productId}`, data, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data;
}

export async function deleteProduct(productId: string) {
  return axios.delete(`${BASE_URL}/product/${productId}`, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function getSingleProduct(productId: string): Promise<Product> {
  const response = await axios.get(`${BASE_URL}/product/single/${productId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data.data.product;
}

export const fetchProducts = async (
  page: number,
  limit: number,
  shop?: string,
): Promise<{ data: Product[]; pages: number }> => {
  const params: { page: number; limit: number; shop?: string } = {
    page,
    limit,
  };

  if (shop) {
    params.shop = shop;
  }

  const response = await axios.get(`${BASE_URL}/product`, {
    params,
  });

  return {
    data: response.data.data,
    pages: response.data.metadata.pages,
  };
};

export const getAllProducts = async () => {
  const res = await axios.get(`${BASE_URL}/product/all-products`, {
    headers: {
      ...authHeaders(),
    },
  });
  return res.data;
};

export const fetchProductsByKeyword = async (
  keyword: string,
  page: number,
  limit: number,
): Promise<{ data: Product[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/product`, {
    params: { keyword, page, limit },
  });
  return {
    data: response.data.data ?? [],
    pages: response.data?.metadata?.pages ?? 1,
  };
};
