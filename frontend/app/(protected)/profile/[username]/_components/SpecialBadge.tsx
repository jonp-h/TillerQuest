import React from "react";
import Image from "next/image";
import { Typography } from "@mui/material";

function SpecialBadge({ badgeTitle }: { badgeTitle: string }) {
  return (
    <div className="flex flex-col justify-center items-center text-center">
      <Image
        className="fade-in"
        src={"/badges/" + badgeTitle + ".png"}
        width={125}
        height={125}
        alt={badgeTitle}
        draggable={false}
      />
      <Typography variant="subtitle1">
        {badgeTitle.replace("-", " ").toUpperCase()}
      </Typography>
    </div>
  );
}

export default SpecialBadge;
