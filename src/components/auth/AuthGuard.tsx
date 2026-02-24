"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check if we haven't already and we are loading
    if (isLoading) {
      checkSession();
    }
  }, [isLoading, checkSession]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If we finished loading and we're not authenticated, boot to login
      // We can also stringify the redirect URL to bring them back after login
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Listen for the global unauthorized event we set up in api.ts
  useEffect(() => {
    const handleUnauthorized = () => {
      useAuthStore.getState().logout();
      router.push("/login?session_expired=true");
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
