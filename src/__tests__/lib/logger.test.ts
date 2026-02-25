import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logError, logWarn } from "@/lib/logger";

describe("logError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls console.error with source prefix and error", () => {
    const error = new Error("test error");
    logError(error, { source: "TestComponent" });

    expect(console.error).toHaveBeenCalledWith("[TestComponent]", error, "");
  });

  it("includes metadata when provided", () => {
    const error = new Error("test");
    const metadata = { userId: "123" };
    logError(error, { source: "API", metadata });

    expect(console.error).toHaveBeenCalledWith("[API]", error, metadata);
  });
});

describe("logWarn", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("calls console.warn in development", () => {
    vi.stubEnv("NODE_ENV", "development");

    logWarn("warning message", { source: "TestComponent" });

    expect(console.warn).toHaveBeenCalledWith(
      "[TestComponent]",
      "warning message",
      "",
    );
  });

  it("does not call console.warn in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    logWarn("warning message", { source: "TestComponent" });

    expect(console.warn).not.toHaveBeenCalled();
  });
});
