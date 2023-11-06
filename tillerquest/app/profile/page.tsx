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
import { width } from "@fortawesome/free-solid-svg-icons/fa0";

export default function Profile() {
  let xp: string = "80%";
  let hp: string = "44%";
  let mana: string = "30%";
  let totalXp: string = "145";
  let totalHp: string = "324";
  let totalMana: string = "456";

  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <div className="flex flex-col gap-2 items-center">
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
          <div className="flex gap-5 text-green-300">
            <h2>Class</h2>
            <h2>Title</h2>
            <h2>Level</h2>
          </div>
          <h3 className="text-orange-300">
            XP: {xp} / {totalXp}
          </h3>

          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-orange-500 h-2.5 rounded-full"
              style={{ width: xp }}
            ></div>
          </div>
          <h3 className="text-red-500">
            HP: {hp} / {totalHp}
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: hp }}
            ></div>
          </div>
          <h3 className="text-blue-400">
            Mana: {mana} / {totalMana}
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: mana }}
            ></div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-10 p-10">
          <div>
            <h2>Gold: 1234</h2>
            <h2>Runestones: 5</h2>
            <h2></h2>
          </div>
          <h2 className="font-extrabold text-2xl">Abilites</h2>
          <div className="grid grid-cols-3 gap-5 md:gap-10 md:grid-cols-4">
            <Abilities />
          </div>
        </div>
      </div>
    </main>
  );
}
