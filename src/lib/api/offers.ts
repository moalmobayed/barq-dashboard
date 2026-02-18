// lib/api/offers.ts
import axios from "axios";
import {
  Offer,
  CreateOfferPayload,
  CreatePackageOfferPayload,
  CreateDeliveryOfferPayload,
} from "@/types/offer";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export async function createOffer(payload: CreateOfferPayload) {
  return axios.post(`${BASE_URL}/offers`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function createPackageOffer(payload: CreatePackageOfferPayload) {
  return axios.post(`${BASE_URL}/product/package`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function createDeliveryOffer(payload: CreateDeliveryOfferPayload) {
  return axios.post(`${BASE_URL}/delivery-offer`, payload, {
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

export async function getSinglePackageOffer(offerId: string): Promise<Offer> {
  const response = await axios.get(`${BASE_URL}/product/${offerId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data.data;
}

export async function getSingleDeliveryOffer(offerId: string): Promise<Offer> {
  const response = await axios.get(`${BASE_URL}/delivery-offer/${offerId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data.data;
}

export const fetchAllOffers = async (
  page?: number,
  limit?: number,
): Promise<{
  offers: Offer[];
  deliveryOffers: Offer[];
  metadata: {
    page: number;
    limit: number;
    offerTotal: number;
    deliveryTotal: number;
    total: number;
    pages: number;
  };
}> => {
  const response = await axios.get(`${BASE_URL}/offers/admin`, {
    params: { page, limit },
    headers: {
      ...authHeaders(),
    },
  });

  const data = response.data.data;
  return {
    offers: data?.offers ?? [],
    deliveryOffers: data?.deliveryOffers ?? [],
    metadata: response.data.metadata ?? {
      page: 1,
      limit: 20,
      offerTotal: 0,
      deliveryTotal: 0,
      total: 0,
      pages: 1,
    },
  };
};

export const fetchDeliveryOffers = async (
  page?: number,
  limit?: number,
): Promise<{ data: Offer[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/delivery-offer`, {
    params: { page, limit },
    headers: {
      ...authHeaders(),
    },
  });

  return {
    data: response.data.data ?? [],
    pages: response.data.metadata?.pages ?? 1,
  };
};

export const fetchPackageOffers = async (
  page?: number,
  limit?: number,
): Promise<{ data: Offer[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/product`, {
    params: { productType: "package", page, limit },
    headers: {
      ...authHeaders(),
    },
  });

  return {
    data: response.data.data ?? [],
    pages: response.data.metadata?.pages ?? 1,
  };
};

export const getAllOffers = async () => {
  const res = await axios.get(`${BASE_URL}/offers/all-offers`, {
    headers: {
      ...authHeaders(),
    },
  });
  return res.data;
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
