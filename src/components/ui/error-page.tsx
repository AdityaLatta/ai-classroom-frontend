"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/logger";
import type { LucideIcon } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  icon: LucideIcon;
  source: string;
  title?: string;
  description?: string;
  className?: string;
}

export function ErrorPage({
  error,
  reset,
  icon: Icon,
  source,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  className = "flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center",
}: ErrorPageProps) {
  useEffect(() => {
    logError(error, {
      source,
      metadata: { digest: error.digest },
    });
  }, [error, source]);

  return (
    <div className={className}>
      <Icon className="h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      <Button onClick={reset} className="mt-4">
        Try Again
      </Button>
    </div>
  );
}
