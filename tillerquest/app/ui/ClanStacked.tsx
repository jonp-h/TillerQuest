import Image from "next/image";
import MiniProfile from "../ui/Miniprofile";

export default function TeamImage() {
  return (
    <>
      {/* Clanview is hidden on smaller devices */}
      <div className="hidden md:flex flex-col">
        <h1 className="text-center font-bold pb-3">Clanname</h1>
        <div className="flex flex-col gap-4 bg-slate-800 p-10 rounded-full">
          {/* First clanmember */}
          <MiniProfile />
          {/* Second clanmember */}
          <MiniProfile />
          {/* Third clanmember */}
          <MiniProfile />
          {/* Fifth clanmember */}
          <MiniProfile />
        </div>
      </div>
    </>
  );
}
