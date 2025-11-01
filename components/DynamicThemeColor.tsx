"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function DynamicThemeColor() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    // Determine the actual theme being used
    const currentTheme = theme === "system" ? systemTheme : theme;

    // Define colors for light and dark modes
    const themeColors = {
      light: "#ffffff",
      dark: "#141414",
    };

    // Get the appropriate color
    const themeColor =
      themeColors[currentTheme as keyof typeof themeColors] ||
      themeColors.light;

    // Update the theme-color meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    } else {
      // Create the meta tag if it doesn't exist
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      metaThemeColor.setAttribute("content", themeColor);
      document.head.appendChild(metaThemeColor);
    }

    // Also update the manifest theme color if in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      // Update CSS custom property for PWA
      document.documentElement.style.setProperty(
        "--pwa-theme-color",
        themeColor
      );
    }
  }, [theme, systemTheme]);

  return null; // This component doesn't render anything
}
