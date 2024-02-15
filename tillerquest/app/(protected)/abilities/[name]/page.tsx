import UserSelect from "@/components/ui/UserSelect";
import { getAbilityByName, useAbilityOnSingleUser } from "@/data/ability";
import { getUsersByCurrentUserClan } from "@/data/user";
import { Button } from "@mui/material";
import { notFound } from "next/navigation";
import { useState } from "react";

export default async function Page({ params }: { params: { name: string } }) {
  const name = params.name;
  const ability = await getAbilityByName(name);
  const members = await getUsersByCurrentUserClan();

  console.log("in ability page");

  // FIXME: redundant?
  if (!ability) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
        <div className="flex flex-col items-center text-center gap-6">
          <h1 className=" text-4xl">{name.replace("-", " ")}</h1>
          <h2 className="text-2xl">
            <span className="text-green-400">
              {ability.type} {ability.value}
            </span>
          </h2>
          <h2 className="text-2xl ">
            Cost: <span className="text-blue-400">{ability.cost} mana</span>
          </h2>
          <h2 className="text-2xl ">
            Experience:{" "}
            <span className="text-orange-400">{ability.xpGiven} xp</span>
          </h2>
          <p className="text-lg max-w-md">{ability.description}</p>
          <UserSelect members={members} value={ability.value} />
        </div>
      </div>
    </main>
  );
}
