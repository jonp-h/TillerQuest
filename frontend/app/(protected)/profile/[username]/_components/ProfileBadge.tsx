import Image from "next/image";
import { Tooltip } from "@mui/material";
import RarityText from "@/components/RarityText";

function ProfileBadge({
  badgeTitle,
  badgeRarity,
  badgeIcon,
  badgeDescription,
}: {
  badgeTitle: string;
  badgeRarity: string;
  badgeIcon: string | null;
  badgeDescription: string | null;
}) {
  return (
    <Tooltip title={badgeDescription} placement="bottom">
      <div className="flex flex-col justify-center items-center text-center">
        <Image
          src={"/items/" + badgeIcon + ".png"}
          width={125}
          height={125}
          alt={badgeTitle}
          draggable={false}
        />
        <RarityText
          rarity={badgeRarity}
          width="full"
          className="text-lg mt-2 text-nowrap"
        >
          {badgeTitle.replace("-", " ").toUpperCase()}
        </RarityText>
      </div>
    </Tooltip>
  );
}

export default ProfileBadge;
