import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  error?: string;
  code?: string;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    return err.response?.data?.message || err.response?.data?.error || fallback;
  }
  return fallback;
}

export function getApiErrorCode(err: unknown): string | null {
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    return err.response?.data?.code ?? null;
  }
  return null;
}
