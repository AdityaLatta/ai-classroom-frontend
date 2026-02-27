"use client";

import { ErrorPage } from "@/components/ui/error-page";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      icon={AlertTriangle}
      source="GlobalErrorBoundary"
      description="An unexpected error occurred. Please try again or contact support if the problem persists."
      className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center"
    />
  );
}
