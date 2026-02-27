import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/test/test-utils";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { useAuthStore } from "@/store/auth.store";

const mockGoogleLogin = vi.fn();

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

vi.mock("@/lib/services/auth.service", () => ({
  googleLogin: (...args: unknown[]) => mockGoogleLogin(...args),
}));

describe("GoogleLoginButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    // Clean up any scripts added to body
    document
      .querySelectorAll('script[src*="accounts.google.com"]')
      .forEach((s) => s.remove());
  });

  it('renders "Or continue with" divider when client ID is configured', () => {
    renderWithProviders(<GoogleLoginButton />);
    expect(screen.getByText("Or continue with")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = renderWithProviders(<GoogleLoginButton />);
    expect(container.innerHTML).not.toBe("");
  });

  it("appends the Google GSI script to the document on mount", () => {
    renderWithProviders(<GoogleLoginButton />);
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    ) as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script?.async).toBe(true);
    expect(script?.defer).toBe(true);
  });

  it("keeps the Google GSI script on unmount for reuse", () => {
    const { unmount } = renderWithProviders(<GoogleLoginButton />);
    unmount();
    // Script is intentionally kept in DOM so re-mounts reuse it
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    expect(script).not.toBeNull();
  });

  it("calls googleLogin when Google SDK callback fires", async () => {
    mockGoogleLogin.mockResolvedValue({
      user: {
        id: "1",
        name: "Test",
        email: "test@test.com",
        role: "STUDENT",
        emailVerified: true,
      },
      accessToken: "token-123",
      isNewUser: false,
    });

    renderWithProviders(<GoogleLoginButton />);

    // Simulate the Google GSI script loading and firing callback
    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    ) as HTMLScriptElement;

    // Mock the google global
    const mockInitialize = vi.fn();
    const mockRenderButton = vi.fn();
    const mockCancel = vi.fn();
    (window as unknown as Record<string, unknown>).google = {
      accounts: {
        id: {
          initialize: mockInitialize,
          renderButton: mockRenderButton,
          cancel: mockCancel,
        },
      },
    };

    // Fire the onload handler
    script.onload?.(new Event("load"));

    // The initialize should have been called with the client ID
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "test-google-client-id",
      }),
    );

    // Extract and call the callback
    const initConfig = mockInitialize.mock.calls[0][0];
    await initConfig.callback({ credential: "google-id-token-123" });

    await waitFor(() => {
      expect(mockGoogleLogin).toHaveBeenCalledWith("google-id-token-123");
    });

    // Cleanup
    delete (window as unknown as Record<string, unknown>).google;
  });

  it("calls onNewUser when login returns isNewUser: true", async () => {
    const onNewUser = vi.fn();
    mockGoogleLogin.mockResolvedValue({
      user: {
        id: "1",
        name: "Test",
        email: "test@test.com",
        role: null,
        emailVerified: true,
      },
      accessToken: "token-123",
      isNewUser: true,
    });

    renderWithProviders(<GoogleLoginButton onNewUser={onNewUser} />);

    // Set up Google SDK mock
    const mockInitialize = vi.fn();
    (window as unknown as Record<string, unknown>).google = {
      accounts: {
        id: {
          initialize: mockInitialize,
          renderButton: vi.fn(),
          cancel: vi.fn(),
        },
      },
    };

    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    ) as HTMLScriptElement;
    script.onload?.(new Event("load"));

    const initConfig = mockInitialize.mock.calls[0][0];
    await initConfig.callback({ credential: "google-id-token-new" });

    await waitFor(() => {
      expect(onNewUser).toHaveBeenCalled();
    });

    delete (window as unknown as Record<string, unknown>).google;
  });

  it("shows error message when googleLogin fails", async () => {
    mockGoogleLogin.mockRejectedValue(new Error("Auth failed"));

    renderWithProviders(<GoogleLoginButton />);

    const mockInitialize = vi.fn();
    (window as unknown as Record<string, unknown>).google = {
      accounts: {
        id: {
          initialize: mockInitialize,
          renderButton: vi.fn(),
          cancel: vi.fn(),
        },
      },
    };

    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    ) as HTMLScriptElement;
    script.onload?.(new Event("load"));

    const initConfig = mockInitialize.mock.calls[0][0];
    await initConfig.callback({ credential: "bad-token" });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to sign in with Google."),
      ).toBeInTheDocument();
    });

    delete (window as unknown as Record<string, unknown>).google;
  });
});
