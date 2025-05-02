"use client"

import { Checkbox } from "@/components/ui/checkbox";

const Timeline = () => {
  return (
    <div className="flex flex-row gap-2 items-top items-center mt-2">
      <Checkbox id="timeline" />
      <div className="grid leading-none">
        <label
          htmlFor="timeline"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
        >
          Pertemuan 1
        </label>
        <p className="text-base font-semibold">
          Mon, 5 February 2025
        </p>
      </div>
    </div>
  );
}

export default Timeline
