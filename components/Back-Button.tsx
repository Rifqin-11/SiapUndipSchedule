"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();

  return (
    <button onClick={() => router.back()} className="p-1 rounded-xl hover:bg-secondary transition">
      <ArrowLeft />
    </button>
  );
};

export default BackButton;
