// lib/api/profile.ts
import axios from "axios";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  passwordChangedAt?: string;
}

export interface ProfileResponse {
  data: AdminProfile;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  fcmToken?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  password: string;
}

// Get admin profile
export async function getAdminProfile(): Promise<ProfileResponse> {
  const response = await axios.get(`${BASE_URL}/admin-profile`, {
    headers: authHeaders(),
  });
  return response.data;
}

// Update admin profile (name and email)
export async function updateAdminProfile(
  payload: UpdateProfilePayload,
): Promise<ProfileResponse> {
  const response = await axios.patch(`${BASE_URL}/admin-profile`, payload, {
    headers: authHeaders(),
  });
  return response.data;
}

// Change admin password
export async function changeAdminPassword(
  payload: ChangePasswordPayload,
): Promise<ProfileResponse> {
  const response = await axios.patch(
    `${BASE_URL}/admin-profile/pass`,
    payload,
    {
      headers: authHeaders(),
    },
  );
  return response.data;
}
