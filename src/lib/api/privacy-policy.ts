// lib/api/privacy-policy.ts
import axios from "axios";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export interface PrivacyPolicyData {
  _id?: string;
  privacyAr?: string;
  privacyEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface UpdatePrivacyPolicyPayload {
  privacyAr?: string;
  privacyEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
}

export const getPrivacy = async (): Promise<{ data: PrivacyPolicyData }> => {
  const response = await axios.get(`${BASE_URL}/privacy`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data;
};

export const updatePrivacy = async (
  payload: UpdatePrivacyPolicyPayload,
): Promise<{ data: PrivacyPolicyData }> => {
  const response = await axios.patch(`${BASE_URL}/privacy`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data;
};
