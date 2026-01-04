"use client";

import ErrorPage from "@/components/ErrorPage";
import { useEffect } from "react";

/**
 * Error boundary
 * Catches errors thrown during server-side data fetching or rendering.
 *
 * This provides a user-friendly error page instead of crashing the entire app.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <ErrorPage text={error.message || "Something went wrong"} reset={reset} />
  );
}
