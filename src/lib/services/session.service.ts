import { api } from "@/lib/api";
import type { Session } from "@/types";

export async function fetchSessions() {
  const { data } = await api.get<Session[]>("/auth/sessions");
  return data;
}

export async function revokeSession(id: string): Promise<void> {
  await api.delete(`/auth/sessions/${id}`);
}

export async function logoutAllSessions(): Promise<void> {
  await api.post("/auth/logout-all", {});
}
