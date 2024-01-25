import Image from "next/image";

export default function ProfileImage() {
  return (
    <div className=" from-slate-700 to-slate-800 bg-gradient-radial md:mt-24 p-4 rounded-full">
      <div className="">
        <Image
          className="rounded-full"
          draggable="false"
          src="/classes/cleric1.jpg"
          alt="Tiller Quest logo"
          width={340}
          height={150}
        />
      </div>
    </div>
  );
}
