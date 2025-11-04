import axios from "axios";
import { BASE_URL } from "../config";
import {
  NotificationsResponse,
  UnreadCountResponse,
  MarkSeenResponse,
  SendNotificationPayload,
  SendNotificationResponse,
} from "@/types/notification";
import { authHeaders } from "./auth";

// Get all notifications with pagination
export async function getNotifications(
  page: number = 1,
  limit: number = 20,
): Promise<NotificationsResponse> {
  const response = await axios.get(
    `${BASE_URL}/notification?page=${page}&limit=${limit}`,
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return response.data;
}

// Get unread notifications count
export async function getUnreadNotificationsCount(): Promise<UnreadCountResponse> {
  const response = await axios.get(`${BASE_URL}/notification/un-read`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data;
}

// Mark notification as seen
export async function markNotificationAsSeen(
  id: string,
): Promise<MarkSeenResponse> {
  const response = await axios.patch(
    `${BASE_URL}/notification/mark-seen/${id}`,
    {},
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return response.data;
}

// Send notification from dashboard
export async function sendNotification(
  payload: SendNotificationPayload,
): Promise<SendNotificationResponse> {
  const response = await axios.post(
    `${BASE_URL}/notification/dashboard`,
    payload,
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return response.data;
}
