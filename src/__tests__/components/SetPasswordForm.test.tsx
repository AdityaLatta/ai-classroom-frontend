import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/test-utils";
import { SetPasswordForm } from "@/components/settings/SetPasswordForm";
import { toast } from "sonner";

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

describe("SetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form fields", () => {
    renderWithProviders(<SetPasswordForm />);

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    renderWithProviders(<SetPasswordForm />);

    expect(
      screen.getByRole("button", { name: "Set Password" }),
    ).toBeInTheDocument();
  });

  it("calls API on valid submit", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({});

    const user = userEvent.setup();

    renderWithProviders(<SetPasswordForm />);

    await user.type(screen.getByLabelText("Password"), "NewPass123");
    await user.type(screen.getByLabelText("Confirm Password"), "NewPass123");
    await user.click(screen.getByRole("button", { name: "Set Password" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/set-password", {
        password: "NewPass123",
      });
    });
  });

  it("shows success toast after setting password", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({});

    const user = userEvent.setup();

    renderWithProviders(<SetPasswordForm />);

    await user.type(screen.getByLabelText("Password"), "NewPass123");
    await user.type(screen.getByLabelText("Confirm Password"), "NewPass123");
    await user.click(screen.getByRole("button", { name: "Set Password" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("shows error message on API failure", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockRejectedValue(new Error("Server error"));

    const user = userEvent.setup();

    renderWithProviders(<SetPasswordForm />);

    await user.type(screen.getByLabelText("Password"), "NewPass123");
    await user.type(screen.getByLabelText("Confirm Password"), "NewPass123");
    await user.click(screen.getByRole("button", { name: "Set Password" }));

    expect(
      await screen.findByText("Failed to set password."),
    ).toBeInTheDocument();
  });
});
