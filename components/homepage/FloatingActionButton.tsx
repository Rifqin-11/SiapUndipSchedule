"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      aria-label="Add subject"
      className={`fixed dark:bg-card text-white bottom-26 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 ${className}`}
    >
      <Plus className="h-6 w-6" aria-hidden="true" />
    </Button>
  );
};

export default FloatingActionButton;
