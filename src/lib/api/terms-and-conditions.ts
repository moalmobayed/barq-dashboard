// lib/api/terms.ts
import axios from "axios";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export interface TermsData {
  _id?: string;
  termAr?: string;
  termEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface UpdateTermsPayload {
  termAr?: string;
  termEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
}

export const getTerms = async (): Promise<{ data: TermsData }> => {
  const response = await axios.get(`${BASE_URL}/terms`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data;
};

export const updateTerms = async (
  payload: UpdateTermsPayload,
): Promise<{ data: TermsData }> => {
  const response = await axios.patch(`${BASE_URL}/terms`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data;
};
