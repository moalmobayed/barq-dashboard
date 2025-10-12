// lib/api/auth.ts
import axios from "axios";
import { BASE_URL } from "../config";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  passwordChangedAt?: string;
  __v: number;
}

export interface LoginResponse {
  data: {
    accessToken: string;
    admin: Admin;
  };
}

export async function loginAdmin(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const response = await axios.post(`${BASE_URL}/admin-auth/login`, payload);
  return response.data;
}

// Helper functions for token management
export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
    localStorage.setItem("isAuthenticated", "true");
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("adminData");
  }
}

export function setAdminData(admin: Admin) {
  if (typeof window !== "undefined") {
    localStorage.setItem("adminData", JSON.stringify(admin));

    // Dispatch custom event to notify components about admin data update
    window.dispatchEvent(new CustomEvent("adminDataUpdated"));
  }
}

export function getAdminData(): Admin | null {
  if (typeof window !== "undefined") {
    const adminData = localStorage.getItem("adminData");
    return adminData ? JSON.parse(adminData) : null;
  }
  return null;
}

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem("isAuthenticated") === "true";
  }
  return false;
}

export function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
