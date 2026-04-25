import { useState, useEffect } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export function useErrorBoundary() {
  const [state, setState] = useState<ErrorBoundaryState>({ hasError: false, error: null });

  const reset = () => setState({ hasError: false, error: null });

  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      console.error("[ErrorBoundary] Caught:", event.error);
      setState({ hasError: true, error: event.error });
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  return { ...state, reset };
}
