import Image from "next/image";
import Link from "next/link";
import TQ from "public/TQ.png";

export default function Home() {
  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="relative flex place-items-center ">
        {/* The React image component, width and height in RENDERED pixels*/}
        <Image
          className="relative drop-shadow-[0_0_10rem_#ffffff70]"
          src={TQ}
          alt="Tiller Quest logo"
          width={280}
          height={150}
          priority
        />
      </div>
      <h1 className="text-6xl transition-transform hover:-translate-y-1 motion-reduce:transform-none">
        Tiller Quest
      </h1>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
    </main>
  );
}
