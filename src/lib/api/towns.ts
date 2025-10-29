// lib/api/towns.ts

import axios from "axios";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

import { CreateCategoryPayload } from "@/types/category";
import { CreateTownPayload, Town } from "@/types/town";

export async function createTown(payload: CreateTownPayload) {
  return axios.post(`${BASE_URL}/towns`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function updateTown(
  town: string,
  data: Partial<CreateCategoryPayload>,
) {
  const response = await axios.patch(`${BASE_URL}/towns/${town}`, data, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data;
}

export async function deleteTown(town: string) {
  return axios.delete(`${BASE_URL}/towns/${town}`, {
    headers: {
      ...authHeaders(),
    },
  });
}

export const fetchTowns = async (): Promise<{
  data: Town[];
}> => {
  const response = await axios.get(`${BASE_URL}/towns`, {
    headers: {
      ...authHeaders(),
    },
  });

  return {
    data: response.data.data,
  };
};

export const getAllTowns = async () => {
  const res = await axios.get(`${BASE_URL}/towns/all`, {
    headers: {
      ...authHeaders(),
    },
  });
  return res.data;
};

export const fetchTownsByKeyword = async (
  keyword: string,
  page: number,
  limit: number,
): Promise<{ data: Town[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/towns`, {
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
