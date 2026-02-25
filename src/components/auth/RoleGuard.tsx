"use client";

import { type ReactNode } from "react";
import { ShieldX } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/auth";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback,
}: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  if (!allowedRoles.includes(user.role)) {
    return (
      fallback ?? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
          <ShieldX className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground max-w-md">
            You do not have permission to view this page.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
