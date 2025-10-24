// lib/api/offers.ts
import axios from "axios";
import { Offer, CreateOfferPayload } from "@/types/offer";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export async function createOffer(payload: CreateOfferPayload) {
  return axios.post(`${BASE_URL}/offers`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function updateOffer(
  offerId: string,
  data: Partial<CreateOfferPayload>,
) {
  const response = await axios.patch(`${BASE_URL}/offers/${offerId}`, data, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data;
}

export async function deleteOffer(offerId: string) {
  return axios.delete(`${BASE_URL}/offers/${offerId}`, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function getSingleOffer(offerId: string): Promise<Offer> {
  const response = await axios.get(`${BASE_URL}/offers/${offerId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data.data;
}

export const fetchOffers = async (
  page?: number,
  limit?: number,
): Promise<{ data: Offer[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/offers`, {
    params: { page, limit },
    headers: {
      ...authHeaders(),
    },
  });

  return {
    data: response.data.data,
    pages: response.data.metadata.pages,
  };
};

export const fetchOffersByKeyword = async (
  keyword: string,
  page: number,
  limit: number,
): Promise<{ data: Offer[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/offers`, {
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
