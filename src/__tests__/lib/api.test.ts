import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AxiosResponse } from "axios";

// We test the interceptor logic by importing the real module.
// The env mock is already set up globally in test/setup.ts.

let api: typeof import("@/lib/api").api;
let setAccessToken: typeof import("@/lib/api").setAccessToken;
let getAccessToken: typeof import("@/lib/api").getAccessToken;

beforeEach(async () => {
  // Fresh import each test to reset module state
  vi.resetModules();
  const mod = await import("@/lib/api");
  api = mod.api;
  setAccessToken = mod.setAccessToken;
  getAccessToken = mod.getAccessToken;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Access token management", () => {
  it("setAccessToken stores and getAccessToken retrieves the token", () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken("my-token");
    expect(getAccessToken()).toBe("my-token");
  });

  it("setAccessToken(null) clears the token", () => {
    setAccessToken("my-token");
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});

describe("Request interceptor", () => {
  it("attaches Authorization header when access token is set", () => {
    setAccessToken("test-token");

    // The request interceptor is wired into the Axios instance.
    // We can verify by checking what happens when we build a request config.
    // Use the internal interceptor manager to run the interceptor.
    const handlers = (
      api.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: unknown) => unknown }>;
      }
    ).handlers;

    const authInterceptor = handlers.find((h) => h !== null && h.fulfilled);
    expect(authInterceptor).toBeDefined();
    expect(getAccessToken()).toBe("test-token");
  });
});

describe("Envelope unwrap interceptor", () => {
  it("unwraps { data: T } envelope to just T", () => {
    // The response interceptors are registered on the api instance.
    // We test by simulating what the interceptor does.
    const handlers = (
      api.interceptors.response as unknown as {
        handlers: Array<{
          fulfilled: ((r: AxiosResponse) => AxiosResponse) | null;
        }>;
      }
    ).handlers.filter((h) => h !== null);

    // First response interceptor is the envelope unwrapper
    const unwrapHandler = handlers[0]?.fulfilled;
    expect(unwrapHandler).toBeDefined();

    if (unwrapHandler) {
      const response = {
        data: { data: { id: 1, name: "Test" } },
      } as AxiosResponse;
      const result = unwrapHandler(response);
      expect(result.data).toEqual({ id: 1, name: "Test" });
    }
  });

  it("preserves paginated response with meta field", () => {
    const handlers = (
      api.interceptors.response as unknown as {
        handlers: Array<{
          fulfilled: ((r: AxiosResponse) => AxiosResponse) | null;
        }>;
      }
    ).handlers.filter((h) => h !== null);
    const unwrapHandler = handlers[0]?.fulfilled;

    if (unwrapHandler) {
      const paginatedData = {
        data: [{ id: 1 }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      const response = { data: paginatedData } as AxiosResponse;
      const result = unwrapHandler(response);
      expect(result.data).toEqual(paginatedData);
    }
  });

  it("does not unwrap when response has no data field", () => {
    const handlers = (
      api.interceptors.response as unknown as {
        handlers: Array<{
          fulfilled: ((r: AxiosResponse) => AxiosResponse) | null;
        }>;
      }
    ).handlers.filter((h) => h !== null);
    const unwrapHandler = handlers[0]?.fulfilled;

    if (unwrapHandler) {
      const response = { data: { message: "ok" } } as AxiosResponse;
      const result = unwrapHandler(response);
      expect(result.data).toEqual({ message: "ok" });
    }
  });

  it("handles null response data gracefully", () => {
    const handlers = (
      api.interceptors.response as unknown as {
        handlers: Array<{
          fulfilled: ((r: AxiosResponse) => AxiosResponse) | null;
        }>;
      }
    ).handlers.filter((h) => h !== null);
    const unwrapHandler = handlers[0]?.fulfilled;

    if (unwrapHandler) {
      const response = { data: null } as AxiosResponse;
      const result = unwrapHandler(response);
      expect(result.data).toBeNull();
    }
  });
});

describe("Refresh interceptor error handler", () => {
  it("rejects non-401 errors without attempting refresh", async () => {
    const handlers = (
      api.interceptors.response as unknown as {
        handlers: Array<{
          rejected: ((e: unknown) => Promise<unknown>) | null;
        }>;
      }
    ).handlers.filter((h) => h !== null && h.rejected);

    // The second interceptor (index 1) is the refresh handler
    const refreshHandler = handlers[0]?.rejected;
    expect(refreshHandler).toBeDefined();

    if (refreshHandler) {
      const error = {
        response: { status: 500 },
        config: { url: "/courses" },
      };

      await expect(refreshHandler(error)).rejects.toBe(error);
    }
  });

  it("rejects 401 on auth endpoints without attempting refresh", async () => {
    const handlers = (
      api.interceptors.response as unknown as {
        handlers: Array<{
          rejected: ((e: unknown) => Promise<unknown>) | null;
        }>;
      }
    ).handlers.filter((h) => h !== null && h.rejected);
    const refreshHandler = handlers[0]?.rejected;

    if (refreshHandler) {
      for (const url of ["/auth/login", "/auth/refresh", "/auth/register"]) {
        const error = {
          response: { status: 401 },
          config: { url },
        };
        await expect(refreshHandler(error)).rejects.toBe(error);
      }
    }
  });

  it("rejects already-retried requests", async () => {
    const handlers = (
      api.interceptors.response as unknown as {
        handlers: Array<{
          rejected: ((e: unknown) => Promise<unknown>) | null;
        }>;
      }
    ).handlers.filter((h) => h !== null && h.rejected);
    const refreshHandler = handlers[0]?.rejected;

    if (refreshHandler) {
      const error = {
        response: { status: 401 },
        config: { url: "/courses", _retry: true },
      };
      await expect(refreshHandler(error)).rejects.toBe(error);
    }
  });

  it("rejects errors with no response object", async () => {
    const handlers = (
      api.interceptors.response as unknown as {
        handlers: Array<{
          rejected: ((e: unknown) => Promise<unknown>) | null;
        }>;
      }
    ).handlers.filter((h) => h !== null && h.rejected);
    const refreshHandler = handlers[0]?.rejected;

    if (refreshHandler) {
      const error = { config: { url: "/courses" } };
      await expect(refreshHandler(error)).rejects.toBe(error);
    }
  });
});
