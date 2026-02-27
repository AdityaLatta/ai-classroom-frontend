import { describe, it, expect, beforeEach } from "vitest";
import { renderWithProviders, screen } from "@/test/test-utils";
import { CourseCard } from "@/components/courses/CourseCard";
import { useAuthStore } from "@/store/auth.store";
import type { Course } from "@/types";
import type { User } from "@/types/auth";

const mockCourse: Course = {
  id: "c1",
  title: "Introduction to TypeScript",
  description: "A comprehensive course on TypeScript fundamentals.",
  instructorId: "u1",
  instructor: { id: "u1", name: "Jane Smith", email: "jane@test.com" },
  status: "PUBLISHED",
  thumbnailUrl: null,
  category: null,
  difficulty: null,
  createdAt: "2024-06-15T00:00:00Z",
  updatedAt: "2024-06-15T00:00:00Z",
};

const ownerUser: User = {
  id: "u1",
  email: "jane@test.com",
  name: "Jane Smith",
  role: "INSTRUCTOR",
  emailVerified: true,
};

const otherUser: User = {
  id: "u2",
  email: "bob@test.com",
  name: "Bob Jones",
  role: "STUDENT",
  emailVerified: true,
};

describe("CourseCard", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("renders course title and description", () => {
    useAuthStore.setState({ user: otherUser, isAuthenticated: true });

    renderWithProviders(<CourseCard course={mockCourse} />);

    expect(screen.getByText("Introduction to TypeScript")).toBeInTheDocument();
    expect(
      screen.getByText("A comprehensive course on TypeScript fundamentals."),
    ).toBeInTheDocument();
  });

  it("renders instructor name", () => {
    useAuthStore.setState({ user: otherUser, isAuthenticated: true });

    renderWithProviders(<CourseCard course={mockCourse} />);

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("links to the course detail page", () => {
    useAuthStore.setState({ user: otherUser, isAuthenticated: true });

    renderWithProviders(<CourseCard course={mockCourse} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/courses/c1");
  });

  it('shows "My Course" badge when user is the instructor', () => {
    useAuthStore.setState({ user: ownerUser, isAuthenticated: true });

    renderWithProviders(<CourseCard course={mockCourse} />);

    expect(screen.getByText("My Course")).toBeInTheDocument();
  });

  it('does not show "My Course" badge for other users', () => {
    useAuthStore.setState({ user: otherUser, isAuthenticated: true });

    renderWithProviders(<CourseCard course={mockCourse} />);

    expect(screen.queryByText("My Course")).not.toBeInTheDocument();
  });
});
