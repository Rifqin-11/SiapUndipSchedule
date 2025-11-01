"use client";

import React from "react";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface ApiErrorProps {
  error: Error | string;
  onRetry?: () => void;
  retryLabel?: string;
  showRetry?: boolean;
}

export const ApiError: React.FC<ApiErrorProps> = ({
  error,
  onRetry,
  retryLabel = "Try Again",
  showRetry = true,
}) => {
  const errorMessage = typeof error === "string" ? error : error.message;
  const isNetworkError =
    errorMessage.toLowerCase().includes("network") ||
    errorMessage.toLowerCase().includes("fetch");

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-4">
        {isNetworkError ? (
          <WifiOff className="w-12 h-12 text-orange-500 mx-auto" />
        ) : (
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {isNetworkError ? "Connection Problem" : "Something went wrong"}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {isNetworkError
          ? "Please check your internet connection and try again."
          : errorMessage || "An unexpected error occurred. Please try again."}
      </p>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4">{icon}</div>}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

interface LoadingErrorProps {
  message?: string;
  onRetry?: () => void;
  isLoading?: boolean;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({
  message = "Failed to load data",
  onRetry,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
      <AlertCircle className="w-10 h-10 text-red-500" />
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">{message}</h4>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isLoading}
            className="mt-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : "Retry"}
          </button>
        )}
      </div>
    </div>
  );
};
