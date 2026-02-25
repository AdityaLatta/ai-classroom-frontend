import { api } from "@/lib/api";
import type { User } from "@/types/auth";

export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout", {});
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}
