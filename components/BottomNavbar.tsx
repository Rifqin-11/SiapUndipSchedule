"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Settings2, UserRound } from "lucide-react";

const BottomNavbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home },
    { href: "/schedule", icon: Calendar },
    { href: "/settings", icon: Settings2 },
    { href: "/user", icon: UserRound },
  ];

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-[360px]
      bg-black/40 backdrop-blur-md border border-white/20 rounded-3xl p-4 flex justify-around
      items-center shadow-lg"
    >
      {navItems.map(({ href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href}>
            <Icon
              className={`h-6 w-6 transition-colors ${
                isActive ? "text-blue-500" : "text-white/80"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavbar;
