"use client";

import { useAuthStore } from "@/store/auth.store";
import { hasRole } from "@/lib/utils";
import { InstructorDashboard } from "@/components/dashboard/InstructorDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  if (hasRole(user, "STUDENT")) {
    return <StudentDashboard user={user} />;
  }

  return <InstructorDashboard user={user} />;
}
