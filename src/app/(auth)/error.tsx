"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { logError } from "@/lib/logger";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, {
      source: "AuthErrorBoundary",
      metadata: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <XCircle className="h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset} className="mt-4">
        Try Again
      </Button>
    </div>
  );
}
