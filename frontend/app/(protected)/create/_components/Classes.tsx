"use client";
import Image from "next/image";
import clsx from "clsx";
import { Tooltip, Zoom } from "@mui/material";

const classes = [
  {
    name: "Wizard1",
    src: "/classes/Wizard1.png",
    description:
      "Wizards use their abilities to gain more mana, and master the art of the arcane.",
  },
  {
    name: "Wizard2",
    src: "/classes/Wizard2.png",
    description:
      "Wizards use their abilities to gain more mana, and master the art of the arcane.",
  },
  {
    name: "Wizard3",
    src: "/classes/Wizard3.png",
    description:
      "Wizards use their abilities to gain more mana, and master the art of the arcane.",
  },
  {
    name: "Wizard4",
    src: "/classes/Wizard4.png",
    description:
      "Wizards use their abilities to gain more mana, and master the art of the arcane.",
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
    name: "BloodMage1",
    src: "/classes/BloodMage1.png",
    description:
      "Bloodmages master the art of blood magic. Using their abilities to manipulate health.",
  },
  {
    name: "BloodMage2",
    src: "/classes/BloodMage2.png",
    description:
      "Bloodmages master the art of blood magic. Using their abilities to manipulate health.",
  },
  {
    name: "BloodMage3",
    src: "/classes/BloodMage3.png",
    description:
      "Bloodmages master the art of blood magic. Using their abilities to manipulate health.",
  },
  {
    name: "BloodMage4",
    src: "/classes/BloodMage4.png",
    description:
      "Bloodmages master the art of blood magic. Using their abilities to manipulate health.",
  },
  {
    name: "Bard1",
    src: "/classes/Bard1.png",
    description: "Bards use their cunning to inspire and buff their allies.",
  },
  {
    name: "Bard2",
    src: "/classes/Bard2.png",
    description: "Bards use their cunning to inspire and buff their allies.",
  },
  {
    name: "Bard3",
    src: "/classes/Bard3.png",
    description: "Bards use their cunning to inspire and buff their allies.",
  },
  {
    name: "Bard4",
    src: "/classes/Bard4.png",
    description: "Bards use their cunning to inspire and buff their allies.",
  },
];

interface ClassesProps {
  playerClass: string;
  setPlayerClass: (playerClass: string) => void;
}

export default function Classes({ playerClass, setPlayerClass }: ClassesProps) {
  return (
    <main className="grid grid-cols-4 gap-7">
      {classes.map((classType) => {
        const className = classType.name;
        const src = classType.src;
        const description = classType.description;
        return (
          <Tooltip
            key={className}
            TransitionComponent={Zoom}
            TransitionProps={{ timeout: 600 }}
            title={description}
            arrow
          >
            <div
              className="text-center hover:cursor-pointer"
              onClick={() => setPlayerClass(className)}
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
