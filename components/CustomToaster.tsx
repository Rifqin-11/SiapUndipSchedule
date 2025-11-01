"use client";

import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const CustomToaster = () => {
  return (
    <>
      {/* Mobile Toaster - Top Center */}
      <SonnerToaster
        position="top-center"
        richColors={false}
        closeButton
        className="lg:hidden"
        toastOptions={{
          style: {
            background: "#000000",
            color: "#ffffff",
            border: "1px solid #333333",
            marginTop: "3rem", // Space for mobile header
          },
          className: "mobile-toast",
          duration: 4000,
        }}
      />

      {/* Desktop Toaster - Bottom Right */}
      <SonnerToaster
        position="bottom-right"
        richColors={false}
        closeButton
        className="hidden lg:block desktop"
        toastOptions={{
          style: {
            background: "#000000",
            color: "#ffffff",
            border: "1px solid #333333",
          },
          className: "desktop-toast",
          duration: 4000,
        }}
      />
    </>
  );
};

export default CustomToaster;
