import { auth } from "@/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  return (
    <main className=" bg-gradient-to-b from-indigo-900 to-purple-950 w-screen min-h-screen">
      <div className="w-screen flex justify-center text-center">
        <div className="mt-36 flex flex-col gap-6 items-center text-6xl">
          <Image src="/TQlogo.png" alt="TillerQuest" width={300} height={300} />
          <h1 className="text-7xl">TillerQuest</h1>
          <br />
          <p className="text-xl">
            Create a user and join a your classmates in a guild
          </p>
          <p className="text-xl">
            Choose a class and come to school every day to gain mana. Spend your
            mana to gain benefits both within the classroom and outside!
          </p>
          <p className="text-xl">
            Find valor and glory by completing daily cosmic events and gain the
            ranks among renowed previous students in the leaderboards!
          </p>
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
