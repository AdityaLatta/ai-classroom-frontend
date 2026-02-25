import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Provide test defaults for validated env vars
vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost:8000/api/v1",
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: "test-google-client-id",
  },
}));
