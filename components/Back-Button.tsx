"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";

const BackButton = () => {
  const router = useRouter();

  return (
    <button onClick={() => router.back()}>
      <ArrowLeft />
    </button>
  );
};

export default BackButton;
