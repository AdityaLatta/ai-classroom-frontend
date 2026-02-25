import { describe, it, expect } from "vitest";
import {
  createCourseSchema,
  updateCourseSchema,
} from "@/lib/validations/course";

describe("createCourseSchema", () => {
  const validData = {
    title: "Introduction to TypeScript",
    description: "Learn the fundamentals of TypeScript programming language.",
  };

  it("accepts valid data", () => {
    const result = createCourseSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    const result = createCourseSchema.safeParse({
      ...validData,
      title: "AB",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 200 characters", () => {
    const result = createCourseSchema.safeParse({
      ...validData,
      title: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rejects description shorter than 10 characters", () => {
    const result = createCourseSchema.safeParse({
      ...validData,
      description: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description longer than 5000 characters", () => {
    const result = createCourseSchema.safeParse({
      ...validData,
      description: "A".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts boundary values (title 3, description 10)", () => {
    const result = createCourseSchema.safeParse({
      title: "ABC",
      description: "1234567890",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCourseSchema", () => {
  it("accepts partial data with only title", () => {
    const result = updateCourseSchema.safeParse({ title: "New Title" });
    expect(result.success).toBe(true);
  });

  it("accepts partial data with only description", () => {
    const result = updateCourseSchema.safeParse({
      description: "Updated description for the course.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateCourseSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("still validates field constraints", () => {
    const result = updateCourseSchema.safeParse({ title: "AB" });
    expect(result.success).toBe(false);
  });
});
