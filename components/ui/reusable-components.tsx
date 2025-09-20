"use client";

import React from "react";

interface StatsCardProps {
  value: string | number;
  label: string;
  color?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  color = "text-blue-600 dark:text-blue-400",
  isLoading = false,
  icon,
  onClick,
}) => {
  const CardComponent = onClick ? "button" : "div";

  return (
    <CardComponent
      onClick={onClick}
      className={`
        bg-white dark:bg-card rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700
        ${
          onClick
            ? "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
            : ""
        }
      `}
    >
      {icon && <div className="flex justify-center mb-2">{icon}</div>}

      <div className={`text-2xl font-bold ${color}`}>
        {isLoading ? (
          <div className="w-6 h-6 mx-auto border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        ) : (
          value
        )}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {label}
      </div>
    </CardComponent>
  );
};

interface TouchableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
}

export const TouchableCard: React.FC<TouchableCardProps> = ({
  children,
  onPress,
  className = "",
  disabled = false,
}) => {
  const baseClasses = `
    block p-4 bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700
    transition-all duration-200 group
  `;

  const interactiveClasses =
    onPress && !disabled
      ? `
    hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600
    active:scale-[0.98] cursor-pointer
  `
      : "";

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <div
      onClick={onPress && !disabled ? onPress : undefined}
      className={`${baseClasses} ${interactiveClasses} ${disabledClasses} ${className}`}
      role={onPress ? "button" : undefined}
      tabIndex={onPress && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (onPress && !disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onPress();
        }
      }}
    >
      {children}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "border-blue-600",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin
        ${className}
      `}
    />
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  color = "bg-blue-600",
  size = "md",
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const heightClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${heightClasses[size]}`}
      >
        <div
          className={`${heightClasses[size]} ${color} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </span>
  );
};
