import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/test-utils";
import { ResendVerificationBanner } from "@/components/auth/ResendVerificationBanner";
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

describe("ResendVerificationBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders the verification warning text", () => {
    renderWithProviders(<ResendVerificationBanner />);

    expect(screen.getByText(/your email is not verified/i)).toBeInTheDocument();
  });

  it("renders an enabled Resend button initially", () => {
    renderWithProviders(<ResendVerificationBanner />);

    const button = screen.getByRole("button", { name: "Resend" });
    expect(button).toBeEnabled();
  });

  it("calls API on resend click", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({});

    const user = userEvent.setup();
    renderWithProviders(<ResendVerificationBanner />);

    await user.click(screen.getByRole("button", { name: "Resend" }));

    expect(api.post).toHaveBeenCalledWith("/auth/resend-verification", {});
  });

  it("shows success toast on successful resend", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({});

    const user = userEvent.setup();
    renderWithProviders(<ResendVerificationBanner />);

    await user.click(screen.getByRole("button", { name: "Resend" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Verification email sent! Check your inbox.",
      );
    });
  });

  it("shows error toast on failure", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    renderWithProviders(<ResendVerificationBanner />);

    await user.click(screen.getByRole("button", { name: "Resend" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("starts cooldown after successful resend", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({});

    const user = userEvent.setup();
    renderWithProviders(<ResendVerificationBanner />);

    await user.click(screen.getByRole("button", { name: "Resend" }));

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent(/Resend in \d+s/);
    });
  });
});
