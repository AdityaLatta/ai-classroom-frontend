"use client";

import { ErrorPage } from "@/components/ui/error-page";
import { XCircle } from "lucide-react";

export default function AuthError({
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
      icon={XCircle}
      source="AuthErrorBoundary"
      className="flex flex-col items-center space-y-4 text-center"
    />
  );
}
