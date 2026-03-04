// lib/config.ts

const isProduction = process.env.NODE_ENV === "production";

export const BASE_URL = isProduction
  ? "https://api.barqshipping.com/api/v1"
  : "https://api-staging.barqshipping.com/api/v1";

export const SOCKET_URL = isProduction
  ? "https://api.barqshipping.com"
  : "https://api-staging.barqshipping.com";
