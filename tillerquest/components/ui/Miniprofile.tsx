import Image from "next/image";
import { Progress } from "./Progress";

export default function MiniProfile(props: any) {
  const image =
    props.member.hp !== 0 ? props.member.image + ".jpg" : "grave.jpg";
  return (
    <div className="flex flex-col  justify-center">
      <div className="bg-slate-700 p-1 rounded-full">
        <Image
          className="rounded-full"
          draggable="false"
          src={"/classes/" + image}
          alt="Clan member"
          width={120}
          height={120}
        />
      </div>
      <div className="flex flex-col gap-1 text-center">
        <h1 className="">{props.member.username}</h1>
        {/* Health bar */}
        <Progress
          value={
            props.member ? (props.member.hp / props.member.hpMax) * 100 : 0
          }
          className="bg-red-500"
        />

        {/* Mana bar */}
        <Progress
          value={
            props.member ? (props.member.mana / props.member.manaMax) * 100 : 0
          }
          className="bg-blue-500"
        />
      </div>
    </div>
  );
}
