// lib/api/settings.ts

import axios from "axios";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";
import { Settings, UpdateSettingsPayload } from "@/types/settings";

export const fetchSettings = async (): Promise<{ data: Settings }> => {
  const response = await axios.get(`${BASE_URL}/settings`, {
    headers: {
      ...authHeaders(),
    },
  });

  return {
    data: response.data.data,
  };
};

export async function updateSettings(payload: UpdateSettingsPayload) {
  const response = await axios.patch(`${BASE_URL}/settings`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data;
}
