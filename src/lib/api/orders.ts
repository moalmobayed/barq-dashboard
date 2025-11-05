// lib/api/orders.ts
import axios from "axios";
import { Order } from "@/types/order";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

// Shared list response metadata
export interface PaginationMeta {
  totalOrders: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Order statistics response
export interface OrderStatsSummary {
  totalOrders: number;
  ordersByStatus: Record<string, number>; // e.g., { pending: 7, processing: 0, ... }
  totalRevenue: number;
  paidOrders: number;
}

// Common query parameters for listing endpoints
export interface OrderQueryParams {
  page?: number;
  limit?: number;
  orderStatus?: string; // pending | processing | shipped | completed | cancelled
  paymentStatus?: string; // pending | paid | failed
  shopId?: string;
  userId?: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  sortBy?: string; // createdAt, etc.
  sortOrder?: "asc" | "desc";
}

export interface OrdersListResponse {
  data: Order[];
  metadata: PaginationMeta;
}

// GET /orders/:orderId
export async function getOrderById(orderId: string): Promise<Order> {
  const res = await axios.get<Order>(`${BASE_URL}/orders/${orderId}`, {
    headers: { ...authHeaders() },
  });
  return res.data;
}

// GET /orders/recent?limit=15
export async function getRecentOrders(limit = 10): Promise<Order[]> {
  const res = await axios.get<{ data: Order[] }>(`${BASE_URL}/orders/recent`, {
    params: { limit },
    headers: { ...authHeaders() },
  });
  return res.data.data;
}

// GET /orders/stats/summary?shopId=&userId=
export async function getOrderStatsSummary(filters?: {
  shopId?: string;
  userId?: string;
}): Promise<OrderStatsSummary> {
  const res = await axios.get<OrderStatsSummary>(
    `${BASE_URL}/orders/stats/summary`,
    {
      params: filters,
      headers: { ...authHeaders() },
    },
  );
  return res.data;
}

// PATCH /orders/:orderId
export async function updateOrder(
  orderId: string,
  data: {
    deliveryAgent?: string;
    orderStatus?: "pending" | "processing" | "completed" | "cancelled" | "shipped";
  },
): Promise<Order> {
  const res = await axios.put<Order>(`${BASE_URL}/orders/${orderId}`, data, {
    headers: { ...authHeaders() },
  });
  return res.data;
}

// DELETE /orders/:orderId
export async function deleteOrderByAdmin(orderId: string): Promise<void> {
  await axios.delete(`${BASE_URL}/orders/${orderId}`, {
    headers: { ...authHeaders() },
  });
}

// GET /orders/user/:userId?page=&limit=&orderStatus=&paymentStatus=&startDate=&endDate=
export async function getUserOrders(
  userId: string,
  params: Omit<OrderQueryParams, "userId"> = {},
): Promise<OrdersListResponse> {
  const res = await axios.get<OrdersListResponse>(
    `${BASE_URL}/orders/user/${userId}`,
    {
      params,
      headers: { ...authHeaders() },
    },
  );
  return res.data;
}

// GET /orders?page=&limit=&... (admin all orders)
export async function getAllOrders(
  params: OrderQueryParams = {},
): Promise<OrdersListResponse> {
  const res = await axios.get<OrdersListResponse>(`${BASE_URL}/orders`, {
    params,
    headers: { ...authHeaders() },
  });
  return res.data;
}

// GET /orders/shop/:shopId?page=&limit=&sortBy=&sortOrder=&...
export async function getShopOrders(
  shopId: string,
  params: Omit<OrderQueryParams, "shopId"> = {},
): Promise<OrdersListResponse> {
  const res = await axios.get<OrdersListResponse>(
    `${BASE_URL}/orders/shop/${shopId}`,
    {
      params,
      headers: { ...authHeaders() },
    },
  );
  return res.data;
}
