import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import {
  faBolt,
  faMagnifyingGlass,
  faUser,
  faRightToBracket,
  faPaperPlane,
  faMoneyBills,
  faMoneyBill,
  faMoneyBill1,
  faMoneyBill1Wave,
  faMoneyBillWaveAlt,
  faMoneyCheck,
  faCircle,
  fa1,
  faCoins,
  faDiamondTurnRight,
  faDiamond,
} from "@fortawesome/free-solid-svg-icons";
import Abilities from "@/components/ui/Abilities";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";
import ProfileImage from "@/components/ui/ProfileImage";
import TeamImage from "@/components/ui/TeamImage";
import ClanStacked from "@/components/ui/ClanStacked";
import { auth, signOut } from "@/auth";
import { getSession, useSession } from "next-auth/react";

export default async function Profile() {
  let xp: string = "80%";
  let hp: string = "44%";
  let mana: string = "30%";
  let totalXp: string = "145";
  let totalHp: string = "324";
  let totalMana: string = "456";

  const session = await auth();

  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <ClanStacked />
        <div className="flex flex-col gap-2 items-center">
          <ProfileImage />

          <h1 className="font-extrabold text-2xl">{session?.user?.name}</h1>
          <form
            action={async () => {
              "use server";

              await signOut();
            }}
          >
            <button type="submit">Sign out</button>
          </form>
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
        <div className="flex flex-col items-center gap-5 p-10">
          <div className="flex gap-3">
            <FontAwesomeIcon
              icon={faCoins}
              className="text-2xl text-yellow-400"
            />
            <h2>Gold: 1234</h2>
            <FontAwesomeIcon
              icon={faDiamond}
              className="text-2xl text-blue-500"
            />
            <h2>Runestones: 5</h2>
          </div>
          <Link
            href="profile/level-up"
            className="text-lg mb-3 bg-purple-900 rounded-lg p-2 px-4 hover:bg-purple-800"
          >
            Level up
          </Link>
          <h2 className="font-extrabold text-2xl">Abilites</h2>
          <div className="grid grid-cols-3 gap-5 md:gap-10 md:grid-cols-4">
            <Abilities />
          </div>
        </div>
      </div>
    </main>
  );
}
