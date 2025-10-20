import MainContainer from "@/components/MainContainer";
import { getGuildmembersByGuildname } from "@/data/user/getGuildmembers";
import { getUserProfileByUsername } from "@/data/user/getUser";
import {
  Avatar,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { notFound } from "next/navigation";
import { red, blue } from "@mui/material/colors";
import {
  Circle,
  Diamond,
  LocalPolice,
  Settings,
  Stadium,
} from "@mui/icons-material";
import MiniatureProfile from "@/components/MiniatureProfile";
import { getUserProfileAbilities } from "@/data/abilities/getters/getAbilities";
import { getUserPassives } from "@/data/passives/getPassive";
import TimeLeft from "@/components/TimeLeft";
import InformationBox from "./_components/InformationBox";
import AbilityCard from "@/components/AbilityCard";
import Link from "next/link";
import ProfileBadge from "./_components/ProfileBadge";
import Log from "./_components/Log";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";
import RarityText from "@/components/RarityText";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await redirectIfNotActiveUser();
  const user = await getUserProfileByUsername(username);

  if (!user) {
    notFound();
  }

  const guildMembers = await getGuildmembersByGuildname(user.guildName || "");

  const userAbilities = await getUserProfileAbilities(user.id);
  const passives = await getUserPassives(user.id);
  return (
    <MainContainer>
      {session?.user.username === user.username && (
        <InformationBox user={user} />
      )}
      <div className="flex flex-col justify-center lg:flex-row">
        {user.guildName && (
          <Paper
            elevation={3}
            className="flex flex-col m-3 lg:w-2/12 w-full order-2 lg:order-1"
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 100,
                height: 100,
                marginTop: "1rem",
                marginX: "auto",
                backgroundColor: "purple.800",
                fontSize: "3rem",
                fontWeight: "bold",
              }}
              src={"/guilds/" + user.guild?.icon}
              draggable={false}
            >
              {user.guildName.charAt(0)}
            </Avatar>
            <Typography variant="h4" align="center" flexWrap="wrap">
              {user.guildName}
            </Typography>
            <div className="grid justify-center grid-flow-col-dense lg:grid-flow-row lg:grid-cols-1  gap-4 items-center p-5 flex-grow">
              {guildMembers?.map((member) =>
                member.username !== user.username ? (
                  <MiniatureProfile key={member.id} member={member} />
                ) : null,
              )}
            </div>

            {session?.user.username === user.username && (
              <Button
                variant="text"
                color="inherit"
                fullWidth
                className="mt-auto"
              >
                <Link href={`/guild`}>View Guild</Link>
              </Button>
            )}
          </Paper>
        )}
        <Paper
          className="flex flex-col m-3 gap-3 items-center p-5 lg:w-5/12 w-full order-first lg:order-2"
          elevation={3}
        >
          {session?.user.username === user.username && (
            <div className="self-end ml-auto absolute">
              <Link href={`/profile/${username}/settings`}>
                <Settings
                  sx={{ opacity: 0.7, ":hover": { color: "white" } }}
                  color="disabled"
                />
              </Link>
            </div>
          )}
          <div className="relative from-zinc-600 to-zinc-700 bg-radial p-3 rounded-full">
            <Image
              className="rounded-full"
              src={
                user.hp !== 0
                  ? "/classes/" + user.image + ".png"
                  : "/classes/Grave.png"
              }
              alt={user.username || ""}
              width={250}
              height={250}
              draggable={false}
            />
            {user.guild?.guildLeader === user.id && (
              <div className="absolute top-5 right-5">
                <Tooltip title="This week's guild leader" arrow placement="top">
                  <LocalPolice sx={{ color: "silver", fontSize: 50 }} />
                </Tooltip>
              </div>
            )}
          </div>
          <div className=" flex justify-evenly gap-3 items-center text-2xl">
            <Typography variant="h5">{user.name}</Typography>
            <Typography
              variant="h4"
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              &quot;{user?.username}&quot;
            </Typography>
            <Typography variant="h5">{user?.lastname}</Typography>
          </div>
          <div className="flex gap-5">
            <RarityText
              className="text-2xl"
              rarity={user.titleRarity || "Common"}
              width="full"
            >
              {user.title}
            </RarityText>
            <Typography variant="h6" color="secondary">
              {user.class}
            </Typography>
            <Typography variant="h6" color="success" className=" text-nowrap">
              Level: {user.level}
            </Typography>
          </div>

          <div className="flex flex-col gap-3 w-3/4 lg:w-2/4 text-center">
            <div>
              <Typography variant="body2" color="orange">
                XP: {user.xp} / {Math.ceil(user.xp / 1000) * 1000}
              </Typography>
              <LinearProgress
                color="experience"
                variant="determinate"
                value={(user.xp % 1000) / 10}
              />
            </div>
            <div>
              <Typography variant="body2" color={red[600]}>
                HP: {user.hp} / {user.hpMax}
              </Typography>
              <LinearProgress
                color="health"
                variant="determinate"
                value={(user.hp / user.hpMax) * 100}
              />
            </div>
            <div>
              <Typography variant="body2" color={blue[300]}>
                Mana: {user.mana} / {user.manaMax}
              </Typography>
              <LinearProgress
                color="mana"
                variant="determinate"
                value={(user.mana / user.manaMax) * 100}
              />
            </div>
          </div>
          <div className="flex w-full mt-3 justify-evenly gap-3 flex-wrap">
            {user.inventory.map((badge) => (
              <ProfileBadge
                key={badge.name}
                badgeTitle={badge.name}
                badgeRarity={badge.rarity}
                badgeIcon={badge.icon}
                badgeDescription={badge.description}
              />
            ))}
          </div>
        </Paper>
        <div className="flex flex-col m-3 gap-3 items-center lg:w-5/12 w-full order-3 lg:order-2">
          <Paper
            className="flex flex-col items-center p-5 w-full h-1/4"
            elevation={3}
          >
            <Typography variant="h4">Resources</Typography>
            <div className="flex mt-2 gap-10">
              <Tooltip title="Earned by completing games in the arena">
                <Typography variant="h5" color="gold" noWrap>
                  Gold: {user.gold}
                  <Circle />
                </Typography>
              </Tooltip>
              <Tooltip title="Earned together with daily mana and certain events/abilities">
                <Typography variant="h5" color="arenatoken" noWrap>
                  Tokens: {user.arenaTokens}
                  <Stadium />
                </Typography>
              </Tooltip>
              <Tooltip title="Earned by gaining experience and leveling up">
                <Typography variant="h5" color="gemstones" noWrap>
                  Gemstones: {user.gemstones}
                  <Diamond />
                </Typography>
              </Tooltip>
            </div>
          </Paper>
          <Paper
            className=" items-center p-5 lg:pb-40 w-full min-h-3/4"
            elevation={3}
          >
            <Typography variant="h4" align="center">
              Passives
            </Typography>
            <div className="grid grid-cols-3 lg:grid-cols-5 mt-4 gap-4">
              {passives?.map((passive) => (
                <Tooltip
                  placement="top"
                  enterDelay={1000}
                  title={passive.ability?.description}
                  key={passive.passiveName}
                >
                  <div
                    className="flex flex-col group items-center text-center gap-2 relative"
                    key={passive.passiveName}
                  >
                    {passive.value === 0 ||
                      (passive.value !== null && (
                        <Chip
                          label={passive.value}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity delay-1000 duration-500 z-999"
                        />
                      ))}
                    <Link
                      href={
                        passive.ability
                          ? "/abilities/" + passive.ability.name
                          : ""
                      }
                      className={
                        passive.ability ? "cursor-pointer" : "cursor-default"
                      }
                    >
                      <Paper
                        elevation={10}
                        sx={{
                          minHeight: "6rem",
                          minWidth: "6rem",
                          borderRadius: "9999px",
                          transition: "transform 0.3s ease-in-out",
                        }}
                        className="flex flex-col justify-center text-center items-center p-2 hover:scale-110"
                      >
                        <Image
                          className="rounded-full"
                          src={"/abilities/" + passive.icon || "Test.jpg"}
                          alt={""}
                          draggable={false}
                          width={100}
                          height={100}
                        />
                      </Paper>
                    </Link>
                    <Typography variant="subtitle1">
                      {passive.passiveName.replace(/-/g, " ")}
                    </Typography>
                    {passive.endTime && (
                      <TimeLeft endTime={new Date(passive.endTime)} />
                    )}
                  </div>
                </Tooltip>
              ))}
            </div>
          </Paper>
        </div>
      </div>
      <Paper elevation={3} className="mx-3 text-center">
        <Typography variant="h4" align="center">
          Abilities
        </Typography>
        {user.hp !== 0 ? (
          <div className="grid grid-cols-3 gap-3 p-5 lg:grid-cols-6 xl:grid-cols-10">
            {userAbilities?.map((ability) => (
              <AbilityCard
                key={ability.ability.name}
                ability={ability.ability}
              />
            ))}
          </div>
        ) : (
          <Typography variant="h5" color="red" className="py-5">
            The dead can do nothing
          </Typography>
        )}
      </Paper>
      <Log userId={user.id} />
    </MainContainer>
  );
}
