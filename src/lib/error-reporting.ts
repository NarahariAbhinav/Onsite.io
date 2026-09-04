/**
 * Error reporting utility for SiteFlow.
 * Captures errors from React error boundaries and logs them to the console.
 * Extend this function to integrate with a real error tracking service
 * (e.g., Sentry, Datadog) when deploying to production.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  const message =
    error instanceof Response
      ? `Response ${(error as Response).status}${(error as Response).url ? ` at ${(error as Response).url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  console.error("[SiteFlow Error]", message, {
    route: typeof window !== "undefined" ? window.location.pathname : "server",
    ...context,
  });
}
