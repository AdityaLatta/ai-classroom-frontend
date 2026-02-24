"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Gem, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        {/* Simple Top Navigation */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex gap-2 items-center font-bold text-lg">
              <Gem className="h-5 w-5 text-primary" />
              <span>AI Classroom</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {user?.role}: {user?.name}
              </span>
              <Button variant="ghost" size="icon" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 container py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
