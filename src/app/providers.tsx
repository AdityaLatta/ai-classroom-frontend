"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Component, useEffect, useRef, useState, ReactNode } from "react";
import { logError } from "@/lib/logger";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    logError(error, { source: "ProvidersErrorBoundary" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground max-w-md">
            An unexpected error occurred. Please try again.
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Initializes auth session exactly once on app mount, and listens for global
 * "unauthorized" events (fired by api.ts when token refresh fails).
 */
function SessionInitializer() {
  const hasChecked = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      useAuthStore.getState().checkSession();
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      useAuthStore.getState().logout();
      router.push("/login?session_expired=true");
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [router]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With Next.js SSR, we usually want to avoid re-fetching immediately on client mount
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          // Note: No global mutation onError handler. All mutations handle
          // errors explicitly in their component-level catch blocks to avoid
          // duplicate Sentry events.
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionInitializer />
      <ErrorBoundary>{children}</ErrorBoundary>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
