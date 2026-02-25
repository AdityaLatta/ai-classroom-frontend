import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    return err.response?.data?.message || err.response?.data?.error || fallback;
  }
  return fallback;
}
