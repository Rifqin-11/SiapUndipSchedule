import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import BottomNavbar from "@/components/BottomNavbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${muliSans.className} antialiased pattern pb-20 scrollbar-none dark:bg-gray-900`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <BottomNavbar />
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
