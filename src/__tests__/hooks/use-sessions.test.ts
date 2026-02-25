import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHookWithProviders, waitFor } from "@/test/test-utils";
import {
  useSessions,
  useRevokeSession,
  useLogoutAll,
  sessionKeys,
} from "@/hooks/use-sessions";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

const mockSessions = [
  {
    id: "s1",
    deviceInfo: "Chrome on MacOS",
    ipAddress: "192.168.1.1",
    createdAt: "2024-01-01T00:00:00Z",
    lastUsedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "s2",
    deviceInfo: "Firefox on Linux",
    ipAddress: "10.0.0.1",
    createdAt: "2024-01-01T00:00:00Z",
    lastUsedAt: "2024-01-03T00:00:00Z",
  },
];

describe("sessionKeys", () => {
  it("generates correct key structure", () => {
    expect(sessionKeys.all).toEqual(["sessions"]);
    expect(sessionKeys.list()).toEqual(["sessions", "list"]);
  });
});

describe("useSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches sessions list", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValue({ data: mockSessions });

    const { result } = renderHookWithProviders(() => useSessions());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith("/auth/sessions");
    expect(result.current.data).toEqual(mockSessions);
  });
});

describe("useRevokeSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls DELETE /auth/sessions/:id", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.delete).mockResolvedValue({});

    const { result } = renderHookWithProviders(() => useRevokeSession());

    await result.current.mutateAsync("s1");

    expect(api.delete).toHaveBeenCalledWith("/auth/sessions/s1");
  });
});

describe("useLogoutAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls POST /auth/logout-all", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({});

    const { result } = renderHookWithProviders(() => useLogoutAll());

    await result.current.mutateAsync();

    expect(api.post).toHaveBeenCalledWith("/auth/logout-all", {});
  });
});
