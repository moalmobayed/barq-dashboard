import axios from "axios";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export async function getDashboardOverview() {
  const res = await axios.get(`${BASE_URL}/admin/dashboard/overview`, {
    headers: {
      ...authHeaders(),
    },
  });
  return res.data.data;
}

export async function getDashboardUsersAnalytics() {
  const res = await axios.get(`${BASE_URL}/admin/dashboard/users/analytics`, {
    headers: {
      ...authHeaders(),
    },
  });
  return res.data.data;
}

export async function getDashboardOrdersAnalytics() {
  const res = await axios.get(`${BASE_URL}/admin/dashboard/orders/analytics`, {
    headers: {
      ...authHeaders(),
    },
  });
  return res.data.data;
}

export async function getDashboardVendorsPerformance() {
  const res = await axios.get(
    `${BASE_URL}/admin/dashboard/vendors/performance`,
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return res.data.data;
}

export async function getDashboardAgentsPerformance() {
  const res = await axios.get(
    `${BASE_URL}/admin/dashboard/agents/performance`,
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return res.data.data;
}

export async function getVendorPerformance(vendorId: string) {
  const res = await axios.get(
    `${BASE_URL}/admin/dashboard/vendors/${vendorId}/performance`,
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return res.data.data;
}
