"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  initializeABTesting,
  getABTestInstance,
  setABTestUserId,
  ABTestingFramework,
} from "@/lib/ab-testing";

interface ABTestingContextValue {
  framework: ABTestingFramework | null;
  isReady: boolean;
  error: string | null;
}

const ABTestingContext = createContext<ABTestingContextValue>({
  framework: null,
  isReady: false,
  error: null,
});

interface ABTestingProviderProps {
  children: ReactNode;
  enabled?: boolean;
  debugMode?: boolean;
}

export function ABTestingProvider({
  children,
  enabled = true,
  debugMode = process.env.NODE_ENV === "development",
}: ABTestingProviderProps) {
  const authContext = useAuth();
  const user = authContext?.user; // Safe access in case auth context is not ready
  const [framework, setFramework] = useState<ABTestingFramework | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsReady(true);
      return;
    }

    try {
      // Initialize A/B testing framework
      const abTestFramework = initializeABTesting({
        enabled,
        debugMode,
        userId: user?.nim || undefined,
        userAttributes: user
          ? {
              userType: "student",
              registrationDate: new Date().toISOString(),
              isNewUser: true,
              userId: user.nim || user.id,
              name: user.name,
              jurusan: user.jurusan,
              fakultas: user.fakultas,
            }
          : {},
        persistAssignments: true,
      });

      setFramework(abTestFramework);
      setError(null);

      if (debugMode) {
        console.log("[A/B Testing] Framework initialized successfully");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize A/B testing";
      setError(errorMessage);
      console.error("[A/B Testing] Initialization error:", err);
    } finally {
      setIsReady(true);
    }
  }, [enabled, debugMode, user]);

  // Update user ID when user changes
  useEffect(() => {
    if (framework && user?.nim) {
      setABTestUserId(user.nim);

      // Update user attributes
      framework.setUserAttributes({
        userType: "student",
        registrationDate: new Date().toISOString(),
        isNewUser: true,
        userId: user.nim || user.id,
        name: user.name,
        jurusan: user.jurusan,
        fakultas: user.fakultas,
      });

      if (debugMode) {
        console.log(`[A/B Testing] User updated: ${user.nim}`);
      }
    }
  }, [framework, user, debugMode]);

  const contextValue: ABTestingContextValue = {
    framework,
    isReady,
    error,
  };

  return (
    <ABTestingContext.Provider value={contextValue}>
      {children}
    </ABTestingContext.Provider>
  );
}

/**
 * Hook to use A/B testing context
 */
export function useABTestingContext(): ABTestingContextValue {
  const context = useContext(ABTestingContext);
  if (!context) {
    throw new Error(
      "useABTestingContext must be used within ABTestingProvider"
    );
  }
  return context;
}

/**
 * HOC to wrap components with A/B testing
 */
export function withABTesting<P extends object>(
  Component: React.ComponentType<P>,
  experimentId: string,
  variantConfigs: Record<string, any> = {}
) {
  return function ABTestWrapper(props: P) {
    const { framework, isReady } = useABTestingContext();
    const { user } = useAuth();

    const [variant, setVariant] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
      if (!framework || !isReady || !user?.nim) return;

      const assignedVariant = framework.getVariant(experimentId, user.nim);
      const variantConfig = assignedVariant
        ? {
            ...variantConfigs[assignedVariant.id],
            ...assignedVariant.config,
          }
        : null;

      setVariant(assignedVariant);
      setConfig(variantConfig);
    }, [framework, isReady, user?.nim]);

    // Pass A/B testing props to the component
    const abTestProps = {
      abTest: {
        variant,
        config,
        experimentId,
        isInExperiment: !!variant,
      },
    };

    return <Component {...props} {...abTestProps} />;
  };
}

/**
 * Debug component for A/B testing (React component version)
 */
export function ABTestDebugPanel() {
  const { framework, isReady, error } = useABTestingContext();
  const { user } = useAuth();

  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (!framework || !isReady) return;

    const activeExperiments = framework.getActiveExperiments(
      user?.nim || undefined
    );
    const experiments = framework.getExperiments();

    setDebugInfo({
      userId: user?.nim,
      totalExperiments: experiments.length,
      activeAssignments: activeExperiments.length,
      activeExperiments,
      error,
    });
  }, [framework, isReady, user?.nim, error]);

  if (process.env.NODE_ENV !== "development" || !debugInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-md z-50 font-mono">
      <div className="font-bold mb-2 text-blue-400">🧪 A/B Test Debug</div>

      {error && (
        <div className="mb-2 p-2 bg-red-900/50 border border-red-500 rounded">
          <div className="text-red-300 font-semibold">Error:</div>
          <div className="text-red-200">{error}</div>
        </div>
      )}

      <div className="mb-2 space-y-1">
        <div>👤 User: {debugInfo.userId || "Not logged in"}</div>
        <div>🧪 Total Experiments: {debugInfo.totalExperiments}</div>
        <div>✅ Active Assignments: {debugInfo.activeAssignments}</div>
        <div>🚀 Ready: {isReady ? "Yes" : "No"}</div>
      </div>

      {debugInfo.activeExperiments.length > 0 && (
        <div className="mb-2">
          <div className="font-semibold mb-1 text-green-400">
            Active Experiments:
          </div>
          <div className="space-y-1">
            {debugInfo.activeExperiments.map(({ experiment, variant }: any) => (
              <div
                key={experiment.id}
                className="pl-2 border-l-2 border-blue-500"
              >
                <div className="font-medium text-blue-300">
                  {experiment.name}
                </div>
                <div className="text-gray-300">→ {variant.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-gray-400 text-xs border-t border-gray-600 pt-2">
        💡 Check DevTools Console for detailed logs
      </div>
    </div>
  );
}

/**
 * Hook for easy A/B testing in components
 */
export function useExperiment(experimentId: string) {
  const { framework, isReady } = useABTestingContext();
  const { user } = useAuth();

  const [variant, setVariant] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!framework || !isReady) {
      setLoading(!isReady);
      return;
    }

    const assignedVariant = framework.getVariant(
      experimentId,
      user?.nim || undefined
    );
    const variantConfig = assignedVariant?.config || null;

    setVariant(assignedVariant);
    setConfig(variantConfig);
    setLoading(false);
  }, [framework, isReady, experimentId, user?.nim]);

  const trackConversion = (metricName: string, value?: any) => {
    if (framework && user?.nim) {
      framework.trackConversion(experimentId, metricName, value, user.nim);
    }
  };

  const isInVariant = (variantId: string): boolean => {
    return variant?.id === variantId;
  };

  return {
    variant,
    config,
    loading,
    isInExperiment: !!variant,
    isInVariant,
    trackConversion,
  };
}
