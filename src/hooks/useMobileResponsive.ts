import { useCallback } from "react";

interface UseMobileResponsiveReturn {
  isMobile: () => boolean;
  handleMobileAction: (
    action: () => void,
    shouldCollapseSidebar?: boolean
  ) => void;
}

/**
 * Custom hook for handling mobile-specific behaviors
 */
export function useMobileResponsive(): UseMobileResponsiveReturn {
  const isMobile = useCallback(() => {
    return window.innerWidth < 1024;
  }, []);

  const handleMobileAction = useCallback(
    (action: () => void, shouldCollapseSidebar = true) => {
      action();
      // Auto-collapse sidebar on mobile after action
      if (shouldCollapseSidebar && isMobile()) {
        // This would need to be integrated with UIContext
        // For now, leaving as a placeholder for the pattern
      }
    },
    [isMobile]
  );

  return {
    isMobile,
    handleMobileAction,
  };
}
