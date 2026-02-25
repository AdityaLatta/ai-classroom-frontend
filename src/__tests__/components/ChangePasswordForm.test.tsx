import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/test-utils";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { mockPush } from "@/test/setup";
import type { User } from "@/types/auth";

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

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("renders the form fields", () => {
    renderWithProviders(<ChangePasswordForm />);

    expect(screen.getByLabelText("Current Password")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    renderWithProviders(<ChangePasswordForm />);

    expect(
      screen.getByRole("button", { name: "Change Password" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();

    renderWithProviders(<ChangePasswordForm />);

    await user.click(screen.getByRole("button", { name: "Change Password" }));

    await waitFor(() => {
      expect(
        screen.getByText(/current password is required/i),
      ).toBeInTheDocument();
    });
  });

  it("calls API and redirects on successful submit", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({});

    const user = userEvent.setup();

    renderWithProviders(<ChangePasswordForm />);

    await user.type(screen.getByLabelText("Current Password"), "OldPass123");
    await user.type(screen.getByLabelText("New Password"), "NewPass123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "NewPass123",
    );
    await user.click(screen.getByRole("button", { name: "Change Password" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/change-password", {
        currentPassword: "OldPass123",
        newPassword: "NewPass123",
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows error message on API failure", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockRejectedValue(new Error("Wrong password"));

    const user = userEvent.setup();

    renderWithProviders(<ChangePasswordForm />);

    await user.type(screen.getByLabelText("Current Password"), "OldPass123");
    await user.type(screen.getByLabelText("New Password"), "NewPass123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "NewPass123",
    );
    await user.click(screen.getByRole("button", { name: "Change Password" }));

    expect(
      await screen.findByText("Failed to change password."),
    ).toBeInTheDocument();
  });
});
