import Image from "next/image";
import Link from "next/link";
import React from "react";

const notfound = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white text-white gap-3">
      <Image src="/notFound.svg" alt="not found" width={150} height={150} />
      <div className="text-black text-center items-center justify-center">
        <h1>Opss! Your page not found</h1>
        <div className="flex flex-row gap-1">
          <p>You can go back to home page</p>
          <Link href="/" className="text-blue-500">
            <div className="text-blue-500 underline ">here</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default notfound;
