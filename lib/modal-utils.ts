import { useEffect } from "react";

/**
 * Utility function to force cleanup of modal-related styles and states
 * This helps prevent UI blocking issues after modal close
 */
export const forceModalCleanup = () => {
  if (typeof document === "undefined") return;

  // Reset body styles
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  document.body.classList.remove("overflow-hidden");

  // Force cleanup of any stuck dialog overlays
  const overlays = document.querySelectorAll('[data-slot="dialog-overlay"]');
  overlays.forEach((overlay) => {
    if (overlay instanceof HTMLElement) {
      overlay.style.pointerEvents = "none";
      overlay.style.display = "none";
    }
  });

  // Remove any Radix UI portal containers that might be stuck
  const portals = document.querySelectorAll("[data-radix-portal]");
  portals.forEach((portal) => {
    if (
      portal instanceof HTMLElement &&
      !portal.querySelector('[data-state="open"]')
    ) {
      // Only remove if no open dialogs are present
      portal.remove();
    }
  });

  // Reset any pointer-events on the body
  document.body.style.pointerEvents = "";
};

/**
 * Hook for automatic modal cleanup
 */
export const useModalCleanup = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) {
      // Cleanup when modal closes
      forceModalCleanup();

      // Additional cleanup after animation delay
      const timeoutId = setTimeout(() => {
        forceModalCleanup();
      }, 300); // Match typical modal animation duration

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      forceModalCleanup();
    };
  }, []);
};
