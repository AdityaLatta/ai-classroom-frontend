import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setAccessToken } from "@/lib/api";

export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (userData: User, accessToken: string) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: (userData: User, accessToken: string) => {
        setAccessToken(accessToken);
        set({ user: userData, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        try {
          // Refresh token cookie is sent automatically
          await api.post("/auth/logout", {});
        } catch {
          // Server-side cleanup failed — clear local state regardless
        } finally {
          setAccessToken(null);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      checkSession: async () => {
        set({ isLoading: true });
        try {
          // On reload the in-memory access token is gone, so this 401s.
          // The interceptor automatically refreshes using the httpOnly cookie,
          // then retries this request with the new access token.
          const { data } = await api.get("/auth/me");
          set({
            user: data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          setAccessToken(null);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
