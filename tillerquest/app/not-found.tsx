import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col items-center gap-8 text-2xl font-extrabold ">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
          src="/404.png"
          alt="Tiller Quest logo"
          width={280}
          height={150}
          priority
        />
        <h2>404 error: Our axe encountered an unknown page!</h2>
        <Link
          className="bg-slate-800 rounded-xl shadow-lg shadow-black p-5"
          href="/"
        >
          Return to earth
        </Link>
      </div>
    </div>
  );
}
