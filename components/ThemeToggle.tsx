"use client";

import * as React from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import "./theme-toggle.css";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      className="relative h-12 w-12 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg dark:hover:shadow-gray-900/50 flex items-center justify-center"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun
          className={`absolute h-5 w-5 text-amber-500 transition-all duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />

        <Moon
          className={`absolute h-5 w-5 text-blue-400 transition-all duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />

        <SunMoon
          className={`absolute h-5 w-5 text-purple-500 transition-all duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] ${
            theme === "system"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-180 scale-0 opacity-0"
          }`}
        />
      </div>

      {theme === "system" && (
        <span className="absolute -top-1 -right-1 block w-2 h-2 rounded-full bg-purple-500 ring-2 ring-background animate-pulse" />
      )}

      <span className="sr-only">
        Switch to{" "}
        {theme === "light" ? "dark" : theme === "dark" ? "system" : "light"}{" "}
        mode
      </span>
    </Button>
  );
}
