import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSessions,
  revokeSession,
  logoutAllSessions,
} from "@/lib/services/session.service";
import { useAuthStore } from "@/store/auth.store";

export const sessionKeys = {
  all: ["sessions"] as const,
  list: () => [...sessionKeys.all, "list"] as const,
};

export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: fetchSessions,
    staleTime: 0, // Security-sensitive — always refetch
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
    },
  });
}

export function useLogoutAll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutAllSessions,
    onSuccess: async () => {
      queryClient.clear();
      await useAuthStore.getState().logout();
    },
  });
}
