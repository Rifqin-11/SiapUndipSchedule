"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import Sidebar from "@/components/Sidebar";
import BottomNavbar from "@/components/BottomNavbar";

const notfound = () => {
  return (
    <div className="flex min-h-screen">
      {/* Main content area */}
      <div className="flex-1 w-full lg:pl-64">
        <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-background  text-white gap-3">
          <Image src="/notFound.svg" alt="not found" width={150} height={150} />
          <div className="text-black dark:text-white text-center items-center justify-center">
            <h1>Opss! Your page not found</h1>
            <div className="flex flex-row gap-1">
              <p>You can go back to home page</p>
              <Link href="/" className="text-blue-500">
                <div className="text-blue-500 underline ">here</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navbar for mobile */}
      <BottomNavbar />
    </div>
  );
};

export default notfound;
