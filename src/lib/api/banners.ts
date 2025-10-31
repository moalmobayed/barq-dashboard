// lib/api/banners.ts

import axios from "axios";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

import { CreateCategoryPayload } from "@/types/category";
import { CreateBannerPayload, Banner } from "@/types/banner";

export async function createBanner(payload: CreateBannerPayload) {
  return axios.post(`${BASE_URL}/banners`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function updateBanner(
  banner: string,
  data: Partial<CreateCategoryPayload>,
) {
  const response = await axios.patch(`${BASE_URL}/banners/${banner}`, data, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data;
}

export async function deleteBanner(banner: string) {
  return axios.delete(`${BASE_URL}/banners/${banner}`, {
    headers: {
      ...authHeaders(),
    },
  });
}

export const fetchBanners = async (): Promise<{
  data: Banner[];
}> => {
  const response = await axios.get(`${BASE_URL}/banners`, {
    headers: {
      ...authHeaders(),
    },
  });

  return {
    data: response.data.data,
  };
};

export const fetchBannersByKeyword = async (
  keyword: string,
  page: number,
  limit: number,
): Promise<{ data: Banner[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/banners`, {
    params: { keyword, page, limit },
    headers: {
      ...authHeaders(),
    },
  });
  return {
    data: response.data.data ?? [],
    pages: response.data?.metadata?.pages ?? 1,
  };
};
