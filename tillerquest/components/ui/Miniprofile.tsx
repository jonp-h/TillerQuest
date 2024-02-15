import Image from "next/image";

export default function MiniProfile(props: any) {
  console.log(props);

  return (
    <div className="flex flex-col  justify-center">
      <div className="bg-slate-700 p-1 rounded-full">
        <Image
          className="rounded-full"
          draggable="false"
          src={"/classes/" + props.member.image + ".jpg"}
          alt="Clan member"
          width={120}
          height={120}
        />
      </div>
      <div className="flex flex-col gap-1 text-center">
        <h1 className="">{props.member.username}</h1>
        {/* Health bar */}
        <div className="bg-gray-700 rounded-full">
          <div
            className="bg-red-500 h-2.5 rounded-full"
            style={{ width: "60%" }}
          ></div>
        </div>
        {/* Mana bar */}
        <div className="rounded-full h-2.5 bg-gray-700">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: "80%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
