// lib/api/customers.ts
import axios from "axios";
import { Customer, CreateCustomerPayload } from "@/types/customer";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export async function createCustomer(payload: CreateCustomerPayload) {
  return axios.post(`${BASE_URL}/auth/complete-profile`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function updateCustomer(
  customerId: string,
  data: Partial<CreateCustomerPayload>,
) {
  const response = await axios.patch(
    `${BASE_URL}/admin/users/${customerId}`,
    data,
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return response.data;
}

export async function deleteCustomer(customerId: string) {
  return axios.delete(`${BASE_URL}/admin/users/${customerId}`, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function getSingleCustomer(customerId: string): Promise<Customer> {
  const response = await axios.get(`${BASE_URL}/admin/users/${customerId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data.data;
}

export const fetchCustomers = async (
  page?: number,
  limit?: number,
): Promise<{ data: Customer[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/admin/customers`, {
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

export const fetchCustomersByKeyword = async (
  keyword: string,
  page: number,
  limit: number,
): Promise<{ data: Customer[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/admin/customers`, {
    params: { keyword, page, limit },
  });
  return {
    data: response.data.data ?? [],
    pages: response.data?.metadata?.pages ?? 1,
  };
};
