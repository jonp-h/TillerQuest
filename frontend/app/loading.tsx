import Image from "next/image";
import React from "react";

export default function Loading() {
  return (
    <div className="w-screen flex justify-center items-center mt-30">
      <Image
        src="/TQlogo.png"
        alt="TillerQuest"
        width={300}
        height={300}
        className=" animate-spin"
      />
    </div>
  );
}
