import React from "react";
import Image from "next/image";
import { Tooltip } from "@mui/material";
import RarityText from "@/components/RarityText";

function ProfileBadge({
  badgeTitle,
  badgeRarity,
  badgeSpecialReq,
  badgeDescription,
}: {
  badgeTitle: string;
  badgeRarity: string;
  badgeSpecialReq: string | null;
  badgeDescription: string | null;
}) {
  return (
    <Tooltip title={badgeDescription} placement="bottom">
      <div className="flex flex-col justify-center items-center text-center">
        <Image
          src={"/badges/" + badgeSpecialReq + ".png"}
          width={125}
          height={125}
          alt={badgeTitle}
          draggable={false}
        />
        <RarityText rarity={badgeRarity} className="text-lg mt-2">
          {badgeTitle.replace("-", " ").toUpperCase()}
        </RarityText>
      </div>
    </Tooltip>
  );
}

export default ProfileBadge;
