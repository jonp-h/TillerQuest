import UserSelect from "@/components/ui/UserSelect";
import { getAbilityByName } from "@/data/ability";
import { notFound } from "next/navigation";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { faCoins, faDiamond } from "@fortawesome/free-solid-svg-icons";
import UserAbilites from "@/components/ui/UserAbilities";
import ProfileImage from "@/components/ui/ProfileImage";
import ClanStacked from "@/components/ui/ClanStacked";
import { auth } from "@/auth";
import {
  getUserWithAbilitiesAndEffectsByUsername,
  getUserById,
  getUserByUsername,
  getUsersByCurrentUserClan,
  getAbilitiesOnUser,
} from "@/data/user";
import { Progress } from "@/components/ui/Progress";
import { Suspense, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import ErrorToast from "@/components/ui/RedirectToast";
import clsx from "clsx";
import { Button } from "@mui/material";
import UserEffects from "@/components/ui/UserEffects";
import { getDailyCosmic } from "@/data/cosmic";

export default async function Page({
  params,
}: {
  params: { username: string };
}) {
  const username = params.username;
  // const user = await getUserByUsername(username); // removed because of the need to also fetch the relation abilities
  //FIXME: remove effects
  const user = await getUserWithAbilitiesAndEffectsByUsername(username);
  // hardcoded if a user has no clan
  const members = await getUsersByCurrentUserClan(user?.clanName || "");

  const effects = user && (await getAbilitiesOnUser(user?.id));

  const day = new Date().toISOString().slice(0, 10);

  const dailyCosmic = await getDailyCosmic();

  // FIXME: redundant?
  if (!username) {
    return <p>not found</p>;
  }

  console.log("fetched data from db in profile page");

  return (
    //Main container with gradient background
    <main
      className={clsx(
        "flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950",
        user?.hp === 0 && " bg-gradient-to-t from-gray-950 to-gray-500 "
      )}
    >
      <ErrorToast />

      <div className=" bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        {/* Information box shown when needed */}
        {/* compares the last time user got mana with current day */}
        {!!user && user?.lastMana !== day ? (
          <div className=" w-full rounded-xl flex flex-col items-center gap-5 p-5 justify-center bg-slate-900">
            <h2>
              Welcome to <span className="text-orange-400">Midgard</span>
            </h2>
            <h2>
              You are worthy of{" "}
              <span className="text-blue-400">daily mana</span>
            </h2>
            <Link href={"../mana"}>
              <Button size="large" variant="contained">
                Daily mana
              </Button>
            </Link>
          </div>
        ) : null}
        {/* Cosmic event box shown when revealed */}
        {dailyCosmic ? (
          <div className=" w-full rounded-xl flex flex-col items-center gap-5 p-5 justify-center bg-slate-900">
            <h1 className=" text-red-500 font-extrabold text-xl">
              {dailyCosmic?.name} has been revealed
            </h1>
            <h2>{dailyCosmic.description}</h2>
          </div>
        ) : null}
        <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10">
          <Suspense fallback={<div>Loading...</div>}>
            <ClanStacked
              clanName={user?.clanName}
              members={members}
              username={username}
            />
          </Suspense>
          <div className="flex flex-col gap-3 items-center">
            <ProfileImage user={user} />

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
            <Link href="profile/abilities">
              <Button size="large" variant="contained">
                Level up
              </Button>
            </Link>

            <h2 className="font-extrabold text-2xl">Effects</h2>
            <div className="grid grid-cols-3 gap-5 md:gap-10 md:grid-cols-4">
              <UserEffects effects={effects} />
            </div>

            <h2 className="font-extrabold text-2xl">Abilites</h2>
            {user?.hp !== 0 ? (
              <div className="grid grid-cols-3 gap-5 md:gap-10 md:grid-cols-4">
                <UserAbilites abilities={user?.abilities} />
              </div>
            ) : (
              <h2 className="text-red-500">The dead can do naught</h2>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
