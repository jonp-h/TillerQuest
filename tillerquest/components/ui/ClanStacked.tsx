import Image from "next/image";
import MiniProfile from "./Miniprofile";

export default function TeamImage(props: any) {
  return (
    <>
      {/* Clanview is hidden on smaller devices */}
      <div className="hidden md:flex flex-col">
        <h1 className="text-center font-bold pb-3">Clanname</h1>
        <div className="flex flex-col gap-4 bg-slate-800 p-10 rounded-full">
          {props.members.map((member: any) => (
            <MiniProfile key={member.id} member={member} />
          ))}
          {/* First clanmember
          <MiniProfile />
          {/* Second clanmember */}
          {/* <MiniProfile /> */}
          {/* Third clanmember */}
          {/* <MiniProfile /> */}
          {/* Fifth clanmember */}
          {/* <MiniProfile /> */}
        </div>
      </div>
    </>
  );
}
