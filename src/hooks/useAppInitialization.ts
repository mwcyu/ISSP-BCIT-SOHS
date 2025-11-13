import { useEffect } from "react";
import { initializeDefaultCodes } from "../utils/accessStorage";

/**
 * Custom hook to initialize app-wide settings and storage
 */
export function useAppInitialization() {
  useEffect(() => {
    const initialize = async () => {
      await initializeDefaultCodes();
    };
    initialize();
  }, []);
}
