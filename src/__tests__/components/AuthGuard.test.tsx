import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/test-utils";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/store/auth.store";
import { mockPush } from "@/test/setup";
import type { User } from "@/types/auth";

const mockUser: User = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
  role: "STUDENT",
  emailVerified: true,
};

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it("shows loading spinner while checking session", () => {
    renderWithProviders(
      <AuthGuard>
        <div>Protected</div>
      </AuthGuard>,
    );

    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(
      <AuthGuard>
        <div>Protected</div>
      </AuthGuard>,
    );

    expect(screen.getByText("Protected")).toBeInTheDocument();
  });

  it("redirects to login when not authenticated after loading", async () => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithProviders(
      <AuthGuard>
        <div>Protected</div>
      </AuthGuard>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/login?redirect="),
      );
    });
  });

  it("listens for unauthorized event and redirects", async () => {
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(
      <AuthGuard>
        <div>Protected</div>
      </AuthGuard>,
    );

    window.dispatchEvent(new Event("unauthorized"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?session_expired=true");
    });
  });
});
