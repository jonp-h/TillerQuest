import MainContainer from "@/components/MainContainer";
import {
  checkIfUserOwnsAbility,
  getAbilityByName,
} from "@/data/abilities/getters/getAbilities";
import { getGuildmembersForAbilityTarget } from "@/data/user/getGuildmembers";
import { getBaseUser } from "@/data/user/getUser";
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
import AbilityForm from "./_components/AbilityForm";
import Image from "next/image";
import { $Enums } from "@tillerquest/prisma/browser";
import { checkIfAllTargetsHavePassive } from "@/data/passives/getPassive";
import { Diamond, Favorite, WaterDrop } from "@mui/icons-material";
import BackButton from "./_components/BackButton";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";

export default async function AbilityNamePage({
  params,
}: {
  params: Promise<{ abilityName: string }>;
}) {
  const session = await redirectIfNotActiveUser();
  const { abilityName } = await params;
  const ability = await getAbilityByName(abilityName);

  if (!ability || !session?.user.id) {
    notFound();
  }

  const user = await getBaseUser(session?.user.id);
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

  const guildMembers = await getGuildmembersForAbilityTarget(
    user.guildName || "",
  );

  // TODO: consider checking if user has passive active for SingleTarget and MultipleTarget. requires moving state from AbilityForm
  let targetsHaveActivePassive = false;
  if (ability.target == "Self") {
    targetsHaveActivePassive = await checkIfAllTargetsHavePassive(
      [user.id],
      abilityName,
    );
  } else if (ability.target == "Others") {
    targetsHaveActivePassive = await checkIfAllTargetsHavePassive(
      guildMembers
        ?.filter((member) => member.id !== user.id)
        .map((member) => member.id) || [],
      abilityName,
    );
  } else if (ability.target == "All") {
    targetsHaveActivePassive = await checkIfAllTargetsHavePassive(
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
          elevation={3}
          className=" text-center items-center p-5 w-fit lg:w-3/5"
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
            <Table sx={{ minWidth: 650 }} aria-label="Ability stats table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Category</TableCell>
                  {ability.duration && (
                    <TableCell align="right">Duration</TableCell>
                  )}
                  <TableCell align="right">Gemstone cost</TableCell>
                  {ability.healthCost && (
                    <TableCell align="right">Health cost</TableCell>
                  )}
                  {ability.manaCost && (
                    <TableCell align="right">Mana cost</TableCell>
                  )}
                  {ability.value && <TableCell align="right">Value</TableCell>}
                  {ability.diceNotation && (
                    <TableCell align="right">Dice</TableCell>
                  )}
                  {ability.xpGiven && <TableCell align="right">XP</TableCell>}
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
                  {ability.duration && (
                    <TableCell align="right">
                      {`${Math.floor(ability.duration / 60)}h ${ability.duration % 60}m`}
                    </TableCell>
                  )}
                  <TableCell align="right">{ability.gemstoneCost}</TableCell>
                  {ability.healthCost && (
                    <TableCell align="right">{ability.healthCost}</TableCell>
                  )}
                  {ability.manaCost && (
                    <TableCell align="right">{ability.manaCost}</TableCell>
                  )}
                  {ability.value && (
                    <TableCell align="right">{ability.value}</TableCell>
                  )}
                  {ability.diceNotation && (
                    <TableCell align="right">{ability.diceNotation}</TableCell>
                  )}
                  {ability.xpGiven && (
                    <TableCell align="right">{ability.xpGiven}</TableCell>
                  )}
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
              targetsHaveActivePassive={targetsHaveActivePassive}
            />
          </div>
        </Paper>
      </div>
    </MainContainer>
  );
}
