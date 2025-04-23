import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import { BellPlus, Calendar, Home, Menu, PersonStanding, Settings2 } from "lucide-react";
import Link from "next/link";
import NotifIcon from "@/components/NotifIcon";

const muliSans = Mulish({
  variable: "--font-mulish-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schedule Siap Undip",
  description: "Aplikasi untuk melihat jadwal kuliah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${muliSans.className} antialiased pattern pb-20 scrollbar-none`}
      >

        {children}

        <div className="fixed bottom-2 left-0 right-0 bg-[#333333] rounded-3xl p-4 flex justify-around items-center max-w-[350px] mx-auto w-full z-50">
          <Link href="/">
            <Home className="text-white" />
          </Link>
          <Link href="/calendar">
            <Calendar className="text-white" />
          </Link>
          <Link href="/">
            <Settings2 className="text-white" />
          </Link>
          <Link href="/">
            <PersonStanding className="text-white" />
          </Link>
        </div>
      </body>
    </html>
  );
}
