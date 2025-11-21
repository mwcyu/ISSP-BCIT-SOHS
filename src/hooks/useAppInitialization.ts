import { useEffect } from "react";

/**
 * Custom hook to initialize app-wide settings.
 * The old accessStorage system has been removed,
 * so no initialization is required anymore.
 */
export function useAppInitialization() {
  useEffect(() => {
    // Nothing to initialize now.
  }, []);
}
