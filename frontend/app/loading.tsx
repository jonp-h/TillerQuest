import Image from "next/image";

export default function Loading() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-background">
      <Image
        src="/TQCircle.svg"
        alt="TillerQuest"
        width={100}
        height={100}
        className=" animate-spin"
      />
    </div>
  );
}
