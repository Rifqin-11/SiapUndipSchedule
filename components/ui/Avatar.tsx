"use client";

import React, { useState } from "react";
import { OptimizedImage } from "../OptimizedImage";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallbackInitials?: string;
  className?: string;
  priority?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  fallbackInitials,
  className = "",
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  };

  const sizePixels = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const initials = fallbackInitials || alt.slice(0, 2).toUpperCase();

  const FallbackAvatar = () => (
    <div
      className={`
        ${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-purple-600
        flex items-center justify-center text-white font-bold ${className}
      `}
    >
      {initials}
    </div>
  );

  if (!src || hasError) {
    return <FallbackAvatar />;
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizePixels[size]}
      height={sizePixels[size]}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      priority={priority || size === "xl"} // Prioritize large avatars
      quality={90} // Higher quality for avatars
      onError={() => setHasError(true)}
      fallback={<FallbackAvatar />}
    />
  );
};
