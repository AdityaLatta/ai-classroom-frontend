interface LogContext {
  source: string;
  metadata?: Record<string, unknown>;
}

export function logError(error: unknown, context: LogContext): void {
  // In production, this is the integration point for Sentry/Datadog/etc.
  console.error(`[${context.source}]`, error, context.metadata ?? "");
}

export function logWarn(message: string, context: LogContext): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[${context.source}]`, message, context.metadata ?? "");
  }
}
