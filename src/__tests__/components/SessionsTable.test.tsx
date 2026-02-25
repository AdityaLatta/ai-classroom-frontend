import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders, screen } from "@/test/test-utils";
import { SessionsTable } from "@/components/settings/SessionsTable";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/types/auth";

const mockRevokeMutateAsync = vi.fn();
const mockLogoutAllMutateAsync = vi.fn();

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
    deviceInfo: "",
    ipAddress: "10.0.0.1",
    createdAt: "2024-01-01T00:00:00Z",
    lastUsedAt: "2024-01-03T00:00:00Z",
  },
];

vi.mock("@/hooks/use-sessions", () => ({
  useSessions: () => ({
    data: mockSessions,
    isLoading: false,
    error: null,
  }),
  useRevokeSession: () => ({
    mutateAsync: mockRevokeMutateAsync,
    isPending: false,
  }),
  useLogoutAll: () => ({
    mutateAsync: mockLogoutAllMutateAsync,
    isPending: false,
  }),
}));

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
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

const mockUser: User = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
  role: "STUDENT",
  emailVerified: true,
};

describe("SessionsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("renders session data in the table", () => {
    renderWithProviders(<SessionsTable />);

    expect(screen.getByText("Chrome on MacOS")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.1")).toBeInTheDocument();
  });

  it('shows "Unknown device" for empty deviceInfo', () => {
    renderWithProviders(<SessionsTable />);

    expect(screen.getByText("Unknown device")).toBeInTheDocument();
  });

  it("renders Revoke buttons for each session", () => {
    renderWithProviders(<SessionsTable />);

    const revokeButtons = screen.getAllByRole("button", { name: "Revoke" });
    expect(revokeButtons).toHaveLength(2);
  });

  it('renders "Logout All Devices" button', () => {
    renderWithProviders(<SessionsTable />);

    expect(
      screen.getByRole("button", { name: "Logout All Devices" }),
    ).toBeInTheDocument();
  });

  it("renders table headers", () => {
    renderWithProviders(<SessionsTable />);

    expect(screen.getByText("Device")).toBeInTheDocument();
    expect(screen.getByText("IP Address")).toBeInTheDocument();
    expect(screen.getByText("Last Active")).toBeInTheDocument();
  });
});
