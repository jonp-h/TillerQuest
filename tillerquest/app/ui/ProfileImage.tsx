import Image from "next/image";

export default function ProfileImage() {
  return (
    <div className="bg-slate-800 w-screen p-10 rounded-full">
      <div className="flex flex-row justify-center">
        <Image
          className=""
          src="/logo/TQ.png"
          alt="Tiller Quest logo"
          width={280}
          height={150}
        />
      </div>
    </div>
  );
}
