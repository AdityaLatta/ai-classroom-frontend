import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAccessToken } from "@/lib/api";
import { logoutUser, fetchCurrentUser } from "@/lib/services/auth.service";
import type { User } from "@/types/auth";

export type { User, UserRole } from "@/types/auth";

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
          await logoutUser();
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
          const user = await fetchCurrentUser();
          set({
            user,
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
