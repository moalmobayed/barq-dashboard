// types/settings.ts

export interface Settings {
  _id: string;
  agentCommissionRate: number;
  earnPointRate: number;
  redeemPointRate: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UpdateSettingsPayload {
  agentCommissionRate?: number;
  earnPointRate?: number;
  redeemPointRate?: number;
}
