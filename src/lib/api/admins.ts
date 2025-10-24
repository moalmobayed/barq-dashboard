// lib/api/admins.ts
import axios from "axios";
import { Admin, CreateAdminPayload } from "@/types/admin";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export async function createAdmin(payload: CreateAdminPayload) {
  return axios.post(`${BASE_URL}/admin-management`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function updateAdmin(
  adminId: string,
  data: Partial<CreateAdminPayload>,
) {
  const response = await axios.patch(
    `${BASE_URL}/admin-management/${adminId}`,
    data,
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return response.data;
}

export async function deleteAdmin(adminId: string) {
  return axios.delete(`${BASE_URL}/admin-management/${adminId}`, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function getSingleAdmin(adminId: string): Promise<Admin> {
  const response = await axios.get(`${BASE_URL}/admin-management/${adminId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data.data;
}

export const fetchAdmins = async (
  page?: number,
  limit?: number,
): Promise<{ data: Admin[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/admin-management`, {
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
