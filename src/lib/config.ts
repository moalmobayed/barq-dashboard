// lib/config.ts

const isVercelPreview =
  typeof window !== "undefined" &&
  window.location.origin === "https://barq-admin.vercel.app";

const isProduction = process.env.NODE_ENV === "production" && !isVercelPreview;

export const BASE_URL = isProduction
  ? "https://api.barqshipping.com/api/v1"
  : "https://api-staging.barqshipping.com/api/v1";

export const SOCKET_URL = isProduction
  ? "https://api.barqshipping.com"
  : "https://api-staging.barqshipping.com";
