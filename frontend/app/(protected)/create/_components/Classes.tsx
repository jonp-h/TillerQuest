"use client";
import Image from "next/image";
import clsx from "clsx";
import { Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { getGuildClasses } from "@/data/guilds/getGuilds";

const classes = [
  {
    name: "Wizard1",
    src: "/classes/Wizard1.png",
    description:
      "Wizards are masters of the arcane, using their abilities to grant more mana to their allies.",
  },
  {
    name: "Wizard2",
    src: "/classes/Wizard2.png",
    description:
      "Wizards are masters of the arcane, using their abilities to grant more mana to their allies.",
  },
  {
    name: "Wizard3",
    src: "/classes/Wizard3.png",
    description:
      "Wizards are masters of the arcane, using their abilities to grant more mana to their allies.",
  },
  {
    name: "Wizard4",
    src: "/classes/Wizard4.png",
    description:
      "Wizards are masters of the arcane, using their abilities to grant more mana to their allies.",
  },
  {
    name: "Barbarian1",
    src: "/classes/Barbarian1.png",
    description:
      "Barbarians are stronger and tougher than other classes, using their abilities to protect their allies.",
  },
  {
    name: "Barbarian2",
    src: "/classes/Barbarian2.png",
    description:
      "Barbarians are stronger and tougher than other classes, using their abilities to protect their allies.",
  },
  {
    name: "Barbarian3",
    src: "/classes/Barbarian3.png",
    description:
      "Barbarians are stronger and tougher than other classes, using their abilities to protect their allies.",
  },
  {
    name: "Barbarian4",
    src: "/classes/Barbarian4.png",
    description:
      "Barbarians are stronger and tougher than other classes, using their abilities to protect their allies.",
  },
  {
    name: "Druid1",
    src: "/classes/Druid1.png",
    description:
      "Druids has a strong connection to nature, using their abilities to heal their allies.",
  },
  {
    name: "Druid2",
    src: "/classes/Druid2.png",
    description:
      "Druids has a strong connection to nature, using their abilities to heal their allies.",
  },
  {
    name: "Druid3",
    src: "/classes/Druid3.png",
    description:
      "Druids has a strong connection to nature, using their abilities to heal their allies.",
  },
  {
    name: "Druid4",
    src: "/classes/Druid4.png",
    description:
      "Druids has a strong connection to nature, using their abilities to heal their allies.",
  },
  {
    name: "Warlock1",
    src: "/classes/Warlock1.png",
    description:
      "Warlocks master the art of crimson magic, using their abilities to manipulate health.",
  },
  {
    name: "Warlock2",
    src: "/classes/Warlock2.png",
    description:
      "Warlocks master the art of crimson magic, using their abilities to manipulate health.",
  },
  {
    name: "Warlock3",
    src: "/classes/Warlock3.png",
    description:
      "Warlocks master the art of crimson magic, using their abilities to manipulate health.",
  },
  {
    name: "Warlock4",
    src: "/classes/Warlock4.png",
    description:
      "Warlocks master the art of crimson magic, using their abilities to manipulate health.",
  },
  {
    name: "Bard1",
    src: "/classes/Bard1.png",
    description:
      "Bards use their cunning to inspire and buff their allies. They also know how to find more gold.",
  },
  {
    name: "Bard2",
    src: "/classes/Bard2.png",
    description:
      "Bards use their cunning to inspire and buff their allies. They also know how to find more gold.",
  },
  {
    name: "Bard3",
    src: "/classes/Bard3.png",
    description:
      "Bards use their cunning to inspire and buff their allies. They also know how to find more gold.",
  },
  {
    name: "Bard4",
    src: "/classes/Bard4.png",
    description:
      "Bards use their cunning to inspire and buff their allies. They also know how to find more gold.",
  },
];

interface ClassesProps {
  playerClass: string;
  setPlayerClass: (playerClass: string) => void;
  userId: string;
  guildId: number;
  refreshTrigger: number;
}

export default function Classes({
  playerClass,
  setPlayerClass,
  userId,
  guildId,
  refreshTrigger,
}: ClassesProps) {
  const [takenClasses, setTakenClasses] = useState<string[]>([]);

  useEffect(() => {
    async function fetchClasses() {
      if (guildId) {
        const takenClasses = await getGuildClasses(userId, guildId);
        setTakenClasses(takenClasses.map((member) => member.class as string));
      }
    }
    fetchClasses();
  }, [guildId, refreshTrigger, userId]);

  return (
    <main className="grid grid-cols-4 gap-7">
      {classes.map((classType) => {
        const className = classType.name;
        const src = classType.src;
        const description = classType.description;
        const isTaken = takenClasses.includes(className.slice(0, -1));
        return (
          <Tooltip
            key={className}
            slotProps={{ transition: { timeout: 600 } }}
            title={
              (isTaken
                ? "A different guildmember has chosen this class. "
                : "") + description
            }
            arrow
          >
            <div
              className={
                isTaken
                  ? "text-center opacity-50 hover:cursor-not-allowed"
                  : "text-center hover:cursor-pointer"
              }
              onClick={() => !isTaken && setPlayerClass(className)}
            >
              <Image
                src={src}
                alt={className}
                className={clsx(
                  "rounded-full shadow-inner shadow-black",
                  className === playerClass &&
                    " border-4 shadow-inner shadow-black border-purple-600 ",
                )}
                width={200}
                height={150}
                draggable="false"
              />
              <h1
                className={clsx(
                  "text-2xl pt-1",
                  className === playerClass && "text-purple-400 font-bold",
                )}
              >
                {className.slice(0, -1)}
              </h1>
            </div>
          </Tooltip>
        );
      })}
    </main>
  );
}
