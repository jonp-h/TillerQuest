import { $Enums } from "@prisma/client";
import React from "react";

const RARITY_CLASSES = {
  common: "text-common/80",
  uncommon: "text-uncommon/80",
  rare: "text-rare/80",
  epic: "rarity text-epic/80",
  legendary: "rarity text-shadow-lg text-legendary/80",
  mythic: "rarity text-mythic/80",
} as const;

function RarityText({
  rarity,
  className,
  children,
}: {
  rarity: string | $Enums.Rarity;
  className?: string;
  children: React.ReactNode;
}) {
  const rarityClass =
    RARITY_CLASSES[rarity.toLowerCase() as keyof typeof RARITY_CLASSES] ||
    "text-common";

  return (
    <h2
      className={`${className} font-extrabold drop-shadow-[2px_2px_rgba(0,0,0,0.8)] ${rarityClass}`}
    >
      {children}
    </h2>
  );
}

export default RarityText;
