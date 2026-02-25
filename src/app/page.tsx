"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (isLoading) {
      if (!hasChecked.current) {
        hasChecked.current = true;
        useAuthStore.getState().checkSession();
      }
    } else {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">AI Classroom</h1>
        <p className="text-muted-foreground text-sm">
          Initializing experience...
        </p>
      </div>
    </div>
  );
}
