import * as Sentry from "@sentry/nextjs";

interface LogContext {
  source: string;
  metadata?: Record<string, unknown>;
}

export function logError(error: unknown, context: LogContext): void {
  console.error(`[${context.source}]`, error, context.metadata ?? "");

  Sentry.captureException(error, {
    tags: { source: context.source },
    extra: context.metadata,
  });
}

export function logWarn(message: string, context: LogContext): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[${context.source}]`, message, context.metadata ?? "");
  }
}
