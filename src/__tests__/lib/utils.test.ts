import { describe, it, expect } from "vitest";
import { cn, getInitials } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("getInitials", () => {
  it("returns initials from full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial for one word", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("truncates to 2 characters", () => {
    expect(getInitials("Mary Jane Watson")).toBe("MJ");
  });

  it("returns uppercase", () => {
    expect(getInitials("jane doe")).toBe("JD");
  });

  it('returns "?" for undefined', () => {
    expect(getInitials(undefined)).toBe("?");
  });

  it('returns "?" for empty string', () => {
    expect(getInitials("")).toBe("?");
  });
});
