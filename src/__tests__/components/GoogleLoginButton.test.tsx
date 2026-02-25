import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen } from "@/test/test-utils";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

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

describe("GoogleLoginButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Or continue with" divider when client ID is configured', () => {
    renderWithProviders(<GoogleLoginButton />);

    expect(screen.getByText("Or continue with")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = renderWithProviders(<GoogleLoginButton />);
    expect(container.innerHTML).not.toBe("");
  });
});
