"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  "aria-label"?: string;
  value?: number;
}) {
  const numericValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={numericValue}
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-blue-900 h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - numericValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
