import { api } from "@/lib/api";
import type { User, UserRole } from "@/types/auth";
import type { AxiosRequestConfig } from "axios";

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<{ user: User; accessToken: string }> {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<void> {
  await api.post("/auth/register", data);
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await api.post("/auth/reset-password", { token, password });
}

export async function verifyEmail(
  token: string,
  config?: AxiosRequestConfig,
): Promise<{ message?: string }> {
  const { data } = await api.post("/auth/verify-email", { token }, config);
  return data;
}

export async function googleLogin(
  idToken: string,
): Promise<{ user: User; accessToken: string; isNewUser: boolean }> {
  const { data } = await api.post("/auth/google", { idToken });
  return data;
}

export async function resendVerification(): Promise<void> {
  await api.post("/auth/resend-verification", {});
}

export async function selectRole(role: UserRole): Promise<{ role: UserRole }> {
  const { data } = await api.post("/auth/select-role", { role });
  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await api.post("/auth/change-password", { currentPassword, newPassword });
}

export async function setPassword(password: string): Promise<void> {
  await api.post("/auth/set-password", { password });
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout", {});
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}
