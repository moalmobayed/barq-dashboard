// lib/api/agents.ts
import axios from "axios";
import { Agent, CreateAgentPayload, Setting } from "@/types/agent";
import { BASE_URL } from "../config";
import { authHeaders } from "./auth";

export async function createAgent(payload: CreateAgentPayload) {
  return axios.post(`${BASE_URL}/admin/users`, payload, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function updateAgent(
  agentId: string,
  data: Partial<CreateAgentPayload>,
) {
  const response = await axios.patch(
    `${BASE_URL}/admin/users/${agentId}`,
    data,
    {
      headers: {
        ...authHeaders(),
      },
    },
  );
  return response.data;
}

export async function deleteAgent(agentId: string) {
  return axios.delete(`${BASE_URL}/admin/users/${agentId}`, {
    headers: {
      ...authHeaders(),
    },
  });
}

export async function getSingleAgent(agentId: string): Promise<Agent> {
  const response = await axios.get(`${BASE_URL}/admin/users/${agentId}`, {
    headers: {
      ...authHeaders(),
    },
  });
  return response.data.data;
}

export const fetchAgents = async (
  page?: number,
  limit?: number,
): Promise<{ data: Agent[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/admin/delivery-agents`, {
    params: { page, limit },
    headers: {
      ...authHeaders(),
    },
  });

  return {
    data: response.data.data,
    pages: response.data.metadata.pages,
  };
};

export const fetchAgentsByKeyword = async (
  keyword: string,
  page: number,
  limit: number,
): Promise<{ data: Agent[]; pages: number }> => {
  const response = await axios.get(`${BASE_URL}/admin/delivery-agents`, {
    params: { keyword, page, limit },
  });
  return {
    data: response.data.data ?? [],
    pages: response.data?.metadata?.pages ?? 1,
  };
};

export const fetchSettings = async (): Promise<{ data: Setting }> => {
  const response = await axios.get(`${BASE_URL}/settings`, {
    headers: {
      ...authHeaders(),
    },
  });
  return {
    data: response.data.data,
  };
};
