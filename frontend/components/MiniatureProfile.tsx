import { LinearProgress, Typography } from "@mui/material";
import { $Enums } from "@tillerquest/prisma/browser";
import Image from "next/image";
import Link from "next/link";
import RarityText from "./RarityText";
import { LocalPolice } from "@mui/icons-material";
import clsx from "clsx";

interface BaseMemberData {
  id: string;
  username: string | null;
  title: string | null;
  titleRarity: $Enums.Rarity | null;
  image: string | null;
  hp: number;
  hpMax: number;
  mana: number;
  manaMax: number;
}

interface FullMemberData extends BaseMemberData {
  guild: {
    guildLeader: string | null;
    nextGuildLeader?: string | null;
  } | null;
}

interface MiniatureProfileProps {
  member: FullMemberData | BaseMemberData;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string[]) => void;
  showBadges?: boolean;
  profileLink?: boolean;
}

function ProfileContent({
  member,
  selectable = false,
  selected = false,
  showBadges = true,
}: Omit<MiniatureProfileProps, "onSelect">) {
  const image = member.hp !== 0 ? member.image + ".png" : "Grave.png";
  const isFullMember = "guild" in member;
  return (
    <div
      className={clsx(
        "flex flex-col justify-center",
        selectable && "cursor-pointer group",
      )}
    >
      <div
        className={clsx(
          "relative flex justify-center self-center rounded-full transition-all duration-200",
          selectable && "group-hover:scale-105",
          selected
            ? "ring-3 ring-purple-700 p-1.5 ring-offset-background"
            : "from-zinc-600 to-zinc-700 bg-radial p-1.5",
        )}
      >
        <Image
          className="rounded-full"
          draggable="false"
          src={"/classes/" + image}
          alt={member.username || "Guild member"}
          width={100}
          height={100}
          sizes="(max-width: 640px) 60px, (max-width: 768px) 80px, 100px"
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "100px",
            maxHeight: "100px",
          }}
        />
        {showBadges &&
          isFullMember &&
          member.guild?.guildLeader === member.id && (
            <div className="absolute top-0 right-0 text-gray-300 text-lg sm:text-xl md:text-2xl">
              <LocalPolice fontSize="inherit" />
            </div>
          )}
        {showBadges &&
          isFullMember &&
          member.guild?.nextGuildLeader === member.id && (
            <div className="absolute top-0 right-0 opacity-20 animate-pulse text-gray-300 text-lg sm:text-xl md:text-2xl">
              <LocalPolice fontSize="inherit" />
            </div>
          )}
      </div>
      <div className="flex flex-col gap-1 text-center items-center">
        <RarityText
          width="full"
          className="-mb-1.5"
          rarity={member.titleRarity ?? ""}
        >
          {member.title}
        </RarityText>
        <Typography
          variant="body1"
          flexWrap="wrap"
          className="text-sm sm:text-base"
        >
          {member.username}
        </Typography>
        {/* Health bar */}
        <LinearProgress
          className="w-20 sm:w-28 md:w-32 self-center"
          variant="determinate"
          value={(member.hp / member.hpMax) * 100}
          color="health"
          sx={{ height: { xs: 6, sm: 8 } }}
        />

        {/* Mana bar */}
        <LinearProgress
          className="w-20 sm:w-28 md:w-32 self-center"
          variant="determinate"
          value={(member.mana / member.manaMax) * 100}
          color="mana"
          sx={{ height: { xs: 6, sm: 8 } }}
        />
      </div>
    </div>
  );
}

export default function MiniatureProfile({
  member,
  selectable = false,
  selected = false,
  onSelect,
  showBadges = true,
  profileLink = true,
}: MiniatureProfileProps) {
  const content = (
    <ProfileContent
      member={member}
      selectable={selectable}
      selected={selected}
      showBadges={showBadges}
    />
  );

  if (selectable && onSelect) {
    return <div onClick={() => onSelect([member.id])}>{content}</div>;
  } else if (profileLink) {
    return <Link href={"/profile/" + member.username}>{content}</Link>;
  } else {
    return <>{content}</>;
  }
}
