"use client";

import { BellPlus, Calendar, Home, LogOut, Menu, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NotifIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}>
        <BellPlus />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg p-4 z-50 w-40">
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/" className="flex flex-row items-center gap-1">
                <Home className="size-4" /> Home
              </Link>
            </li>
            <li>
              <Link
                href="/calendar"
                className="flex flex-row items-center gap-1"
              >
                <Calendar className="size-4" /> Calendar
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="flex flex-row items-center gap-1"
              >
                <Settings2 className="size-4" />
                Settings
              </Link>
            </li>
            <li>
              <Link href="/logout" className="flex flex-row items-center gap-1">
                <LogOut className="size-4" />
                Logout
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
