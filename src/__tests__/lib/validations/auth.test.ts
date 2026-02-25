import { describe, it, expect } from "vitest";
import {
  passwordSchema,
  changePasswordSchema,
  setPasswordSchema,
} from "@/lib/validations/auth";

describe("passwordSchema", () => {
  it("accepts a valid password", () => {
    const result = passwordSchema.safeParse("ValidPass1");
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = passwordSchema.safeParse("Short1A");
    expect(result.success).toBe(false);
  });

  it("rejects password longer than 72 characters", () => {
    const long = "Aa1" + "x".repeat(70);
    const result = passwordSchema.safeParse(long);
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase letter", () => {
    const result = passwordSchema.safeParse("lowercase1");
    expect(result.success).toBe(false);
  });

  it("rejects password without lowercase letter", () => {
    const result = passwordSchema.safeParse("UPPERCASE1");
    expect(result.success).toBe(false);
  });

  it("rejects password without digit", () => {
    const result = passwordSchema.safeParse("NoDigitHere");
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const validData = {
    currentPassword: "oldpassword",
    newPassword: "NewPassword1",
    confirmNewPassword: "NewPassword1",
  };

  it("accepts valid data", () => {
    const result = changePasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects when passwords do not match", () => {
    const result = changePasswordSchema.safeParse({
      ...validData,
      confirmNewPassword: "DifferentPass1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("confirmNewPassword");
    }
  });

  it("rejects empty current password", () => {
    const result = changePasswordSchema.safeParse({
      ...validData,
      currentPassword: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("setPasswordSchema", () => {
  const validData = {
    password: "NewPassword1",
    confirmPassword: "NewPassword1",
  };

  it("accepts valid data", () => {
    const result = setPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects when passwords do not match", () => {
    const result = setPasswordSchema.safeParse({
      ...validData,
      confirmPassword: "DifferentPass1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("confirmPassword");
    }
  });
});
