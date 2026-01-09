// types/agent.ts
export interface CreateAgentPayload {
  name: string;
  mobile: string;
  role: "delivery-agent";
  status?: string;
  rating?: number;
  reviewCount?: number;
  commissionRate?: number;
}

export interface Agent {
  _id: string;
  name: string;
  mobile: string;
  role: "delivery-agent";
  status?: string;
  rating?: number;
  reviewCount?: number;
  commissionRate: number;
}

export interface Setting {
  _id: string;
  agentCommissionRate: string;
  createdAt?: string;
  updatedAt?: string;
}
