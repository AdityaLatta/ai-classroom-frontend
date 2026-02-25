import { describe, it, expect } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { getApiErrorMessage } from "@/lib/api-error";

function makeAxiosError(
  data: Record<string, unknown> | null,
  status = 400,
): AxiosError {
  const error = new AxiosError("Request failed");
  if (data !== null) {
    error.response = {
      data,
      status,
      statusText: "Bad Request",
      headers: {},
      config: {} as AxiosResponse["config"],
    } as AxiosResponse;
  }
  return error;
}

describe("getApiErrorMessage", () => {
  it("extracts message from response.data.message", () => {
    const err = makeAxiosError({ message: "Email already in use" });
    expect(getApiErrorMessage(err, "fallback")).toBe("Email already in use");
  });

  it("extracts error from response.data.error", () => {
    const err = makeAxiosError({ error: "Unauthorized" });
    expect(getApiErrorMessage(err, "fallback")).toBe("Unauthorized");
  });

  it("prefers message over error field", () => {
    const err = makeAxiosError({ message: "Specific msg", error: "Generic" });
    expect(getApiErrorMessage(err, "fallback")).toBe("Specific msg");
  });

  it("returns fallback when response has no message or error", () => {
    const err = makeAxiosError({});
    expect(getApiErrorMessage(err, "Something went wrong")).toBe(
      "Something went wrong",
    );
  });

  it("returns fallback for non-Axios errors", () => {
    expect(getApiErrorMessage(new Error("boom"), "fallback")).toBe("fallback");
  });

  it("returns fallback for null/undefined", () => {
    expect(getApiErrorMessage(null, "fallback")).toBe("fallback");
    expect(getApiErrorMessage(undefined, "fallback")).toBe("fallback");
  });
});
