import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import {
  faBolt,
  faMagnifyingGlass,
  faUser,
  faRightToBracket,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import Abilities from "../ui/Abilities";

export default function Home() {
  const abilities = [
    {
      name: "Action",
      href: "/action",
      icon: faBolt,
    },
    {
      name: "Explore",
      href: "/explore",
      icon: faMagnifyingGlass,
    },
    {
      name: "About Us",
      href: "/about-us",
      icon: faPaperPlane,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: faUser,
    },
    {
      name: "Login",
      icon: faRightToBracket,
    },
  ];

  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <div className="flex flex-col gap-5 items-center">
          <div className="bg-slate-800 p-10 rounded-full">
            <Image
              className=""
              src="/logo/TQ.png"
              alt="Tiller Quest logo"
              width={280}
              height={150}
            />
          </div>

          <h1 className="font-extrabold text-2xl">Username</h1>
          <div className="flex gap-5 text-orange-300">
            <h2>Class</h2>
            <h3>Level</h3>
            <h3>XP</h3>
          </div>

          <h3 className="text-green-500">HP</h3>
          <h3 className="text-blue-500">Mana</h3>
        </div>
        <div className="flex flex-col items-center gap-10 p-10">
          <h2 className="font-extrabold text-2xl">Abilites</h2>
          <div className="grid grid-cols-2 gap-5 md:gap-10 md:grid-cols-4">
            <Abilities />
          </div>
        </div>
      </div>
    </main>
  );
}
