import { auth } from "@/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  return (
    <main className=" bg-gradient-to-b from-violet-900 to-slate-950 w-screen min-h-screen">
      <div className="w-screen flex justify-center text-center">
        <div className="mt-36 flex flex-col gap-6 items-center text-6xl">
          <Image src="/TQlogo.png" alt="TillerQuest" width={300} height={300} />
          <h1 className="text-7xl">TillerQuest</h1>
          <br />
          <h2 className="text-3xl font-extrabold">
            For{" "}
            <span className="font-extrabold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              teachers and students
            </span>
            ,
            <br />
            by{" "}
            <span className="font-extrabold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              teachers and students
            </span>
          </h2>
        </div>
      </div>
      {/* <Image
        src="/background-image.jpg"
        alt="background"
        className="-z-10 opacity-80"
        layout="fill"
        objectFit="cover"
        quality={100}
      /> */}
    </main>
  );
}
