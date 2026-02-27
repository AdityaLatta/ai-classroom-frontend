"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  className,
  showLabel = true,
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="space-y-1">
      <div className={cn("h-2 w-full rounded-full bg-secondary", className)}>
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground text-right">
          {clampedValue}%
        </p>
      )}
    </div>
  );
}
