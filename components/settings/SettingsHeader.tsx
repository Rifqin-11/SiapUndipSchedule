"use client";

import React, { useState, useEffect } from "react";
import BackButton from "@/components/Back-Button";

interface SettingsHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

const SettingsHeader = ({ title, description, icon }: SettingsHeaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY <= 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <section
      className={`bg-background border-b border-border sticky top-0 z-50 shadow-sm transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-full mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 bg-secondary rounded-lg">{icon}</div>}
            <div>
              <h1 className="text-lg font-semibold text-card-foreground">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsHeader;
