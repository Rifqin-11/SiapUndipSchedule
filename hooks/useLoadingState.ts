import { useState, useEffect } from "react";

/**
 * Custom hook for managing loading states with minimum loading time
 * @param initialLoading - Initial loading state
 * @param minLoadingTime - Minimum time to show loading (in milliseconds)
 * @returns loading state and setLoading function
 */
export const useLoadingState = (
  initialLoading: boolean = true,
  minLoadingTime: number = 1000
) => {
  const [loading, setLoading] = useState(initialLoading);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        setMinTimeElapsed(true);
      }, minLoadingTime);

      return () => clearTimeout(timer);
    }
  }, [initialLoading, minLoadingTime]);

  const setLoadingWithDelay = (newLoading: boolean) => {
    if (!newLoading && !minTimeElapsed) {
      // Wait for minimum time before allowing loading to be set to false
      const remainingTime = minLoadingTime;
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    } else {
      setLoading(newLoading);
    }
  };

  return [loading && !minTimeElapsed, setLoadingWithDelay] as const;
};

/**
 * Simulates loading state for development/demo purposes
 * @param duration - Loading duration in milliseconds
 * @returns loading state
 */
export const useSimulatedLoading = (duration: number = 1500) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return loading;
};
