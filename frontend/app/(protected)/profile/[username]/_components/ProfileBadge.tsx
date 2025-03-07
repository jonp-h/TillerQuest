import React from "react";
import Image from "next/image";
import { Tooltip, Typography } from "@mui/material";

function ProfileBadge({
  badgeTitle,
  badgeSpecialReq,
  badgeDescription,
}: {
  badgeTitle: string;
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
        <Typography variant="subtitle1">
          {badgeTitle.replace("-", " ").toUpperCase()}
        </Typography>
      </div>
    </Tooltip>
  );
}

export default ProfileBadge;
