import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";

export default function NavBar() {
  return (
    <nav className="flex w-full place-content-between items-center bg-gradient-to-r from-slate-800 to-slate-950">
      <Link href="/">
        <div className="flex items-center py-2 pl-10">
          <Image
            className="drop-shadow-[0_0_0.4rem_#ffffff70]"
            src="/logo/TQ.png"
            alt="Tiller Quest logo"
            width={45}
            height={150}
          />

          <h1 className="pl-8 font-bold text-sm md:text-xl lg:text-3xl">
            Tiller Quest
          </h1>
        </div>
      </Link>

      <div className="flex gap-20 text-lg justify-between pr-10">
        <NavLinks />
      </div>
    </nav>
  );
}
