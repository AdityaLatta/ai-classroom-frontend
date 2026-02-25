import { describe, it, expect, beforeEach } from "vitest";
import { renderWithProviders, screen } from "@/test/test-utils";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/types/auth";

const studentUser: User = {
  id: "1",
  email: "student@example.com",
  name: "Student User",
  role: "STUDENT",
  emailVerified: true,
};

const instructorUser: User = {
  id: "2",
  email: "instructor@example.com",
  name: "Instructor User",
  role: "INSTRUCTOR",
  emailVerified: true,
};

const adminUser: User = {
  id: "3",
  email: "admin@example.com",
  name: "Admin User",
  role: "ADMIN",
  emailVerified: true,
};

describe("RoleGuard", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("renders children when user has an allowed role", () => {
    useAuthStore.setState({ user: studentUser, isAuthenticated: true });

    renderWithProviders(
      <RoleGuard allowedRoles={["STUDENT"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("shows Access Denied for disallowed role", () => {
    useAuthStore.setState({ user: studentUser, isAuthenticated: true });

    renderWithProviders(
      <RoleGuard allowedRoles={["INSTRUCTOR"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders custom fallback for disallowed role", () => {
    useAuthStore.setState({ user: studentUser, isAuthenticated: true });

    renderWithProviders(
      <RoleGuard
        allowedRoles={["INSTRUCTOR"]}
        fallback={<div>Custom Denied</div>}
      >
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Custom Denied")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
  });

  it("returns null when user is null", () => {
    const { container } = renderWithProviders(
      <RoleGuard allowedRoles={["STUDENT"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("allows ADMIN access when ADMIN is in allowedRoles", () => {
    useAuthStore.setState({ user: adminUser, isAuthenticated: true });

    renderWithProviders(
      <RoleGuard allowedRoles={["ADMIN", "INSTRUCTOR"]}>
        <div>Admin Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});
