import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex justify-items-center gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <div className="flex flex-col gap-5 items-center">
          <div className="bg-slate-800 p-10 rounded-full">
            <Image
              className=""
              src="/logo/TQ.png"
              alt="Tiller Quest logo"
              width={280}
              height={150}
            />
          </div>

          <h1>Username</h1>
          <div className="flex gap-5">
            <h2>Class</h2>
            <h3>Level</h3>
            <h3>XP</h3>
          </div>

          <h3>HP</h3>
          <h3>Mana</h3>
        </div>
        <div className="flex flex-col items-center gap-10 p-10">
          <h2>Abilites</h2>
        </div>
      </div>
    </main>
  );
}
