import MainContainer from "@/components/MainContainer";
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
import { Diamond, Favorite, WaterDrop } from "@mui/icons-material";
import BackButton from "./_components/BackButton";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import { Class } from "@tillerquest/prisma/browser";
import { secureGet, securePost } from "@/lib/secureFetch";
import { BaseUser } from "@/types/users";
import {
  AbilityAndOwnershipResponse,
  GuildMember,
} from "./_components/interfaces";
import ErrorAlert from "@/components/ErrorAlert";

export default async function AbilityNamePage({
  params,
}: {
  params: Promise<{ abilityName: string }>;
}) {
  const session = await redirectIfNotActiveUser();
  const { abilityName } = await params;
  const ability = await secureGet<AbilityAndOwnershipResponse>(
    `/abilities/${abilityName}`,
  );

  if (!ability.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={ability.error || "Ability not found."} />
      </MainContainer>
    );
  }

  const user = await secureGet<BaseUser>(`/users/${session.user.id}`);

  if (!user.ok) {
    return (
      <MainContainer>
        <ErrorAlert message={user.error || "User not found."} />
      </MainContainer>
    );
  }

  const userIsCorrectClass =
    !Object.values(Class).includes(ability.data.ability.category as Class) ||
    user.data.class === ability.data.ability.category;

  const userOwnsAbility = ability.data.ownAbility;
  const missingParentAbility = !ability.data.ownParentAbility;

  const guildMembers = await secureGet<GuildMember[]>(
    `/guilds/${user.data.guildName}/members/ability-targets`,
  );

  let targetsHaveActivePassive = false;
  if (guildMembers.ok) {
    // TODO: consider checking if user has passive active for SingleTarget and MultipleTarget. requires moving state from AbilityForm
    if (ability.data.ability.target == "Self") {
      targetsHaveActivePassive = await securePost<boolean>(
        `/abilities/${abilityName}/passive-check`,
        {
          userIds: [session.user.id],
        },
      ).then((res) => res.ok && res.data);
    } else if (ability.data.ability.target == "Others") {
      targetsHaveActivePassive = await securePost<boolean>(
        `/abilities/${abilityName}/passive-check`,
        {
          userIds:
            guildMembers.data
              .filter((member) => member.id !== session.user.id)
              .map((member) => member.id) || [],
        },
      ).then((res) => res.ok && res.data);
    } else if (ability.data.ability.target == "All") {
      targetsHaveActivePassive = await securePost<boolean>(
        `/abilities/${abilityName}/passive-check`,
        {
          userIds: guildMembers.data.map((member) => member.id) || [],
        },
      ).then((res) => res.ok && res.data);
    }
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
                  : ability.data.ability.manaCost
                    ? "bg-blue-800 p-3 rounded-xl"
                    : "bg-red-800 p-3 rounded-xl"
              }
            >
              {!userOwnsAbility ? (
                <Typography variant="body1" color="white">
                  {user.data.gemstones} <Diamond htmlColor="white" />
                </Typography>
              ) : ability.data.ability.manaCost ? (
                <Typography variant="body1" color="white">
                  {user.data.mana}
                  <WaterDrop htmlColor="white" />
                </Typography>
              ) : (
                <Typography variant="body1" color="white">
                  {user.data.hp} <Favorite htmlColor="white" />
                </Typography>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex justify-center rounded-full mb-3 p-5 from-zinc-600 to-zinc-700 bg-radial">
              {ability.data.ability.name && (
                <Image
                  className="rounded-full"
                  src={"/abilities/" + ability.data.ability.icon}
                  alt={ability.data.ability.name}
                  width={200}
                  height={200}
                />
              )}
            </div>
          </div>
          <Typography variant="h3">
            {ability.data.ability.name.replace(/-/g, " ")}
          </Typography>
          <Typography variant="body1" className="py-5">
            {ability.data.ability.description}
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="Ability stats table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Category</TableCell>
                  {ability.data.ability.duration && (
                    <TableCell align="right">Duration</TableCell>
                  )}
                  <TableCell align="right">Gemstone cost</TableCell>
                  {ability.data.ability.healthCost && (
                    <TableCell align="right">Health cost</TableCell>
                  )}
                  {ability.data.ability.manaCost && (
                    <TableCell align="right">Mana cost</TableCell>
                  )}
                  {ability.data.ability.value && (
                    <TableCell align="right">Value</TableCell>
                  )}
                  {ability.data.ability.diceNotation && (
                    <TableCell align="right">Dice</TableCell>
                  )}
                  {ability.data.ability.xpGiven && (
                    <TableCell align="right">XP</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {ability.data.ability.name.replace(/-/g, " ")}
                  </TableCell>
                  <TableCell align="right">
                    {ability.data.ability.category}
                  </TableCell>
                  {ability.data.ability.duration && (
                    <TableCell align="right">
                      {`${Math.floor(ability.data.ability.duration / 60)}h ${ability.data.ability.duration % 60}m`}
                    </TableCell>
                  )}
                  <TableCell align="right">
                    {ability.data.ability.gemstoneCost}
                  </TableCell>
                  {ability.data.ability.healthCost && (
                    <TableCell align="right">
                      {ability.data.ability.healthCost}
                    </TableCell>
                  )}
                  {ability.data.ability.manaCost && (
                    <TableCell align="right">
                      {ability.data.ability.manaCost}
                    </TableCell>
                  )}
                  {ability.data.ability.value && (
                    <TableCell align="right">
                      {ability.data.ability.value}
                    </TableCell>
                  )}
                  {ability.data.ability.diceNotation && (
                    <TableCell align="right">
                      {ability.data.ability.diceNotation}
                    </TableCell>
                  )}
                  {ability.data.ability.xpGiven && (
                    <TableCell align="right">
                      {ability.data.ability.xpGiven}
                    </TableCell>
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <div className="my-5">
            <AbilityForm
              ability={ability.data.ability}
              user={user.data}
              guildMembers={guildMembers.ok ? guildMembers.data : []}
              isPurchaseable={ability.data.ability.purchaseable}
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
