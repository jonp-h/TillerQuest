import { auth } from "@/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  return (
    <main className=" bg-gradient-to-b from-indigo-900 to-purple-950 w-screen min-h-screen">
      <div className="w-screen flex justify-center text-center">
        <div className="mt-36 grid gap-6 text-6xl">
          <Image src="/TQlogo.png" alt="TillerQuest" width={300} height={300} />
          <h1>TillerQuest</h1>
        </div>
      </div>
    </main>
  );
}
