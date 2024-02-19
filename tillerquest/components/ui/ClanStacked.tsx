import Image from "next/image";
import MiniProfile from "./Miniprofile";

export default function ClanStacked(props: any) {
  return (
    <>
      {/* Clanview is hidden on smaller devices */}
      <div className="hidden md:flex flex-col">
        <h1 className="text-center font-bold pb-3">
          {props.clanName || "Clan"}
        </h1>
        <div className="flex flex-col gap-4 bg-slate-800 p-8 rounded-full">
          {/* Fills in the clan interface without the current user */}
          {props.members.map((member: any) =>
            member.username !== props.username ? (
              <MiniProfile key={member.id} member={member} />
            ) : null
          )}
        </div>
      </div>
    </>
  );
}
