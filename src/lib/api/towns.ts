import axios from "axios";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export interface Town {
  _id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  // Add other town properties as needed
}

export const getAllTowns = async () => {
  const res = await axios.get(`${BASE_URL}/towns/all`, {
    headers: {
      ...authHeaders(),
    },
  });
  return res.data;
};
