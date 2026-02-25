import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/types/auth";

// Mock api module — self-contained (no importActual to avoid env.ts side-effect)
let _accessToken: string | null = null;

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  setAccessToken: (token: string | null) => {
    _accessToken = token;
  },
  getAccessToken: () => _accessToken,
}));

const mockUser: User = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
  role: "STUDENT",
  emailVerified: true,
};

describe("auth.store", () => {
  beforeEach(() => {
    _accessToken = null;
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it("login sets user, isAuthenticated, and access token", () => {
    useAuthStore.getState().login(mockUser, "test-token");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(_accessToken).toBe("test-token");
  });

  it("logout clears user state and access token", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({});

    useAuthStore.getState().login(mockUser, "test-token");
    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(_accessToken).toBeNull();
  });

  it("logout clears state even when server call fails", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockRejectedValue(new Error("Network error"));

    useAuthStore.getState().login(mockUser, "test-token");
    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("checkSession sets user on success", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValue({ data: mockUser });

    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("checkSession clears state on failure", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockRejectedValue(new Error("401"));

    useAuthStore.getState().login(mockUser, "test-token");
    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});
