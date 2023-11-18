import Image from "next/image";

export default function ProfileImage() {
  return (
    <div className="bg-slate-800 md:mt-24 p-4 rounded-full">
      <div className="">
        <Image
          className="rounded-full"
          draggable="false"
          src="/classes/rogue3.jpg"
          alt="Tiller Quest logo"
          width={340}
          height={150}
        />
      </div>
    </div>
  );
}
