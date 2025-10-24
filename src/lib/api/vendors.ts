// lib/api/vendors.ts
import axios from "axios";
import { Vendor, CreateVendorPayload } from "@/types/vendor";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export async function createVendor(payload: CreateVendorPayload) {
  return axios.post(`${BASE_URL}/admin/users`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function updateVendor(
  vendorId: string,
  data: Partial<CreateVendorPayload>,
) {
  const response = await axios.patch(
    `${BASE_URL}/admin/users/${vendorId}`,
    data,
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return response.data;
}

export async function deleteVendor(vendorId: string) {
  return axios.delete(`${BASE_URL}/admin/users/${vendorId}`, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function getSingleVendor(vendorId: string): Promise<Vendor> {
  const response = await axios.get(`${BASE_URL}/admin/users/${vendorId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data.data;
}

export const fetchVendors = async (
  page?: number,
  limit?: number,
): Promise<{ data: Vendor[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/admin/vendors`, {
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

export const fetchVendorsByKeyword = async (
  keyword: string,
  page: number,
  limit: number,
): Promise<{ data: Vendor[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/admin/vendors`, {
    params: { keyword, page, limit },
  });
  return {
    data: response.data.data ?? [],
    pages: response.data?.metadata?.pages ?? 1,
  };
};

export const fetchVendorsBasic = async (): Promise<{
  data: Vendor[];
}> => {
  const response = await axios.get(`${BASE_URL}/public/all-vendors`);

  return {
    data: response.data.data,
  };
};
