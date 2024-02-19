import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { faCoins, faDiamond } from "@fortawesome/free-solid-svg-icons";
import Abilities from "@/components/ui/AbilityGrid";
import ProfileImage from "@/components/ui/ProfileImage";
import ClanStacked from "@/components/ui/ClanStacked";
import { auth } from "@/auth";
import { getUserById, getUsersByCurrentUserClan } from "@/data/user";
import { Progress } from "@/components/ui/Progress";
import { Suspense, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import ErrorToast from "@/components/ui/RedirectToast";

export default async function Profile() {
  const session = await auth();

  let user;
  let members;
  if (session && session.user?.id) {
    user = await getUserById(session.user.id);
    //TODO: remove hardcoding
    members = await getUsersByCurrentUserClan(user?.clanName || "");
    console.log("fetched data from db in profile page");
  }

  return (
    //Main container with gradient background
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <ErrorToast />
      {session?.user?.role !== "NEW" ? (
        <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
          <Suspense fallback={<div>Loading...</div>}>
            <ClanStacked members={members} user={user?.id} />
          </Suspense>
          <div className="flex flex-col gap-3 items-center">
            <ProfileImage playerClass={user?.image || "Cleric1"} />

            <div className=" flex justify-evenly gap-3 items-center text-2xl">
              <h2>{user?.name}</h2>
              <h2 className=" font-extrabold text-violet-400 text-3xl">
                &quot;{user?.username}&quot;
              </h2>
              <h2>{user?.lastname}</h2>
            </div>
            <div className="flex gap-5 text-xl text-green-300">
              <h2>{user?.title}</h2>
              <h2>{user?.class}</h2>
              <h2>{user?.level}</h2>
            </div>

            {/* Progress bars */}
            <h3 className="text-orange-300">
              XP: {user?.xp} / {500}
            </h3>
            {/* <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-orange-500 h-2.5 rounded-full"
                style={{ width: user?.xp }}
              ></div>
            </div> */}

            {/* TODO: make percentage based on level requirement */}
            <Progress
              value={user ? (user.xp / 500) * 100 : 0}
              className="bg-orange-500"
            />

            <h3 className="text-red-500">
              HP: {user?.hp} / {user?.hpMax}
            </h3>
            <Progress
              value={user ? (user.hp / user.hpMax) * 100 : 0}
              className="bg-red-500"
            />
            <h3 className="text-blue-400">
              Mana: {user?.mana} / {user?.manaMax}
            </h3>
            <Progress
              value={user ? (user.mana / user.manaMax) * 100 : 0}
              className="bg-blue-500"
            />
          </div>
          <div className="flex flex-col items-center gap-5 p-10">
            <div className="flex gap-3">
              <FontAwesomeIcon
                icon={faCoins}
                className="text-2xl text-yellow-400"
              />
              <h2>Gold: {user?.gold}</h2>
              <FontAwesomeIcon
                icon={faDiamond}
                className="text-2xl text-blue-500"
              />
              <h2>Runestones: {user?.runes}</h2>
            </div>
            <Link
              href="profile/abilities"
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
      ) : (
        <Link className="bg-slate-900 p-5 rounded-xl" href={"/create"}>
          Create user profile
        </Link>
      )}
    </main>
  );
}
