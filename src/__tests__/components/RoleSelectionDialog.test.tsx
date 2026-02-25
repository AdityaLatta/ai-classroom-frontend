import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/test-utils";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";
import { useAuthStore } from "@/store/auth.store";
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

describe("RoleSelectionDialog", () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("renders role options", () => {
    renderWithProviders(
      <RoleSelectionDialog open={true} onComplete={mockOnComplete} />,
    );

    expect(screen.getByText("Student")).toBeInTheDocument();
    expect(screen.getByText("Instructor")).toBeInTheDocument();
  });

  it("renders dialog title", () => {
    renderWithProviders(
      <RoleSelectionDialog open={true} onComplete={mockOnComplete} />,
    );

    expect(screen.getByText("Welcome! Choose your role")).toBeInTheDocument();
  });

  it("has Continue button disabled when no role is selected", () => {
    renderWithProviders(
      <RoleSelectionDialog open={true} onComplete={mockOnComplete} />,
    );

    expect(screen.getByText("Continue")).toBeDisabled();
  });

  it("enables Continue after selecting a role", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <RoleSelectionDialog open={true} onComplete={mockOnComplete} />,
    );

    await user.click(screen.getByText("Student"));

    expect(screen.getByText("Continue")).toBeEnabled();
  });

  it("calls API and onComplete on successful submit", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({
      data: { role: "STUDENT" },
    });

    const user = userEvent.setup();

    renderWithProviders(
      <RoleSelectionDialog open={true} onComplete={mockOnComplete} />,
    );

    await user.click(screen.getByText("Student"));
    await user.click(screen.getByText("Continue"));

    expect(api.post).toHaveBeenCalledWith("/auth/select-role", {
      role: "STUDENT",
    });
  });

  it("shows error message on API failure", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();

    renderWithProviders(
      <RoleSelectionDialog open={true} onComplete={mockOnComplete} />,
    );

    await user.click(screen.getByText("Student"));
    await user.click(screen.getByText("Continue"));

    expect(
      await screen.findByText("Failed to set role. Please try again."),
    ).toBeInTheDocument();
  });
});
