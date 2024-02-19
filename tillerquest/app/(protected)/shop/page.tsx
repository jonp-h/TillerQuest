import React from "react";
import Image from "next/image";

export default function Shop() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <h1 className=" text-4xl">Closed</h1>
      <Image
        className=" rounded-xl"
        alt="shop"
        src="/shop.jpg"
        width={700}
        height={120}
      />
    </main>
  );
}
