import axios from "axios";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export async function getAdminTickets(page = 1) {
  const res = await axios.get(`${BASE_URL}/tickets/admin`, {
    params: { page },
    headers: {
      ...authHeaders(),
    },
  });
  return res.data;
}

export async function getSupportReplies(chatId: string, limit?: number) {
  const res = await axios.get(`${BASE_URL}/replies/support/${chatId}`, {
    params: limit ? { limit } : {},
    headers: {
      ...authHeaders(),
    },
  });
  return res.data;
}

export async function createSupportReply(ticket: string, message: string) {
  const res = await axios.post(
    `${BASE_URL}/replies/`,
    { ticket, message },
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return res.data;
}
