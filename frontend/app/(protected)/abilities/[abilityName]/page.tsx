import { auth } from "@/auth";
import MainContainer from "@/components/MainContainer";
import {
  checkIfUserOwnsAbility,
  getAbilityByName,
} from "@/data/abilities/getters/getAbilities";
import { getGuildmembersByGuildname } from "@/data/user/getGuildmembers";
import { getUserById } from "@/data/user/getUser";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { notFound } from "next/navigation";
import React from "react";
import AbilityForm from "./_components/AbilityForm";
import Image from "next/image";
import { $Enums } from "@prisma/client";
import { checkIfAllTargetsHavePassive } from "@/data/passives/getPassive";
import { Diamond, Favorite, WaterDrop } from "@mui/icons-material";
import BackButton from "./_components/BackButton";

export default async function AbilityNamePage({
  params,
}: {
  params: Promise<{ abilityName: string }>;
}) {
  const { abilityName } = await params;
  const ability = await getAbilityByName(abilityName);
  const session = await auth();

  if (!ability || !session?.user.id) {
    console.error(
      "Ability " + abilityName + " not found or user not logged in.",
    );
    notFound();
  }

  const user = await getUserById(session?.user.id);
  if (!user) {
    notFound();
  }

  const userIsCorrectClass =
    !Object.values($Enums.Class).includes(ability.category as $Enums.Class) ||
    user.class === ability.category;

  const userOwnsAbility = await checkIfUserOwnsAbility(
    session?.user.id,
    abilityName,
  );

  // check if root, if not check if user owns parent ability
  let missingParentAbility = true;
  if (ability.parentAbility === null) {
    missingParentAbility = false;
  } else {
    missingParentAbility = !(await checkIfUserOwnsAbility(
      user.id,
      ability.parentAbility,
    ));
  }

  const guildMembers = await getGuildmembersByGuildname(user.guildName || "");

  // TODO: consider checking if user has passive active for SingleTarget and MultipleTarget. requires moving state from AbilityForm
  let targetHasPassive = false;
  if (ability.target == "Self") {
    targetHasPassive = await checkIfAllTargetsHavePassive(
      [user.id],
      abilityName,
    );
  } else if (ability.target == "All" || ability.target == "Others") {
    // check if all guild members have active passive
    targetHasPassive = await checkIfAllTargetsHavePassive(
      guildMembers?.map((member) => member.id) || [],
      abilityName,
    );
  }

  return (
    <MainContainer>
      <div
        id="dice-canvas"
        className="fixed mt-24 z-10 inset-0 w-full h-11/12 pointer-events-none"
      />
      <div className="flex justify-center">
        <Paper
          elevation={5}
          className=" text-center items-center p-5 w-full md:w-2/3 xl:w-1/2"
        >
          {/* back button */}
          <div className="flex justify-between w-full">
            <div className="flex flex-col">
              <BackButton />
            </div>

            <div
              className={
                !userOwnsAbility
                  ? "bg-blue-400 p-3 rounded-xl"
                  : ability.manaCost
                    ? "bg-blue-800 p-3 rounded-xl"
                    : "bg-red-800 p-3 rounded-xl"
              }
            >
              {!userOwnsAbility ? (
                <Typography variant="body1" color="white">
                  {user.gemstones} <Diamond htmlColor="white" />
                </Typography>
              ) : ability.manaCost ? (
                <Typography variant="body1" color="white">
                  {user.mana}
                  <WaterDrop htmlColor="white" />
                </Typography>
              ) : (
                <Typography variant="body1" color="white">
                  {user.hp} <Favorite htmlColor="white" />
                </Typography>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex justify-center rounded-full mb-3 p-5 from-zinc-600 to-zinc-700 bg-radial">
              {ability.name && (
                <Image
                  className="rounded-full"
                  src={"/abilities/" + ability.icon}
                  alt={ability.name}
                  width={200}
                  height={200}
                />
              )}
            </div>
          </div>
          <Typography variant="h3">
            {ability.name.replace(/-/g, " ")}
          </Typography>
          <Typography variant="body1" className="py-5">
            {ability.description}
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Category</TableCell>
                  <TableCell align="right">Duration</TableCell>
                  <TableCell align="right">Gemstone cost</TableCell>
                  <TableCell align="right">Health cost</TableCell>
                  <TableCell align="right">Mana cost</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">Dice</TableCell>
                  <TableCell align="right">XP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {ability.name.replace(/-/g, " ")}
                  </TableCell>
                  <TableCell align="right">{ability.category}</TableCell>
                  <TableCell align="right">{ability.duration}</TableCell>
                  <TableCell align="right">{ability.gemstoneCost}</TableCell>
                  <TableCell align="right">{ability.healthCost}</TableCell>
                  <TableCell align="right">{ability.manaCost}</TableCell>
                  <TableCell align="right">{ability.value}</TableCell>
                  <TableCell align="right">{ability.diceNotation}</TableCell>
                  <TableCell align="right">{ability.xpGiven}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <div className="my-5">
            <AbilityForm
              ability={ability}
              user={user}
              guildMembers={guildMembers}
              isPurchaseable={ability.purchaseable}
              userOwnsAbility={userOwnsAbility}
              userIsCorrectClass={userIsCorrectClass}
              missingParentAbility={missingParentAbility}
              targetHasPassive={targetHasPassive}
            />
          </div>
        </Paper>
      </div>
    </MainContainer>
  );
}
