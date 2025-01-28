"use client";
import Image from "next/image";
import clsx from "clsx";
import { Tooltip, Zoom } from "@mui/material";

const classes = [
  {
    name: "Wizard1",
    src: "/classes/Wizard1.png",
    description: "Lorem ipsum solar sit amet cleric",
  },
  {
    name: "Wizard2",
    src: "/classes/Wizard2.png",
    description: "Lorem ipsum solar sit amet cleric",
  },
  {
    name: "Wizard3",
    src: "/classes/Wizard3.png",
    description: "Lorem ipsum solar sit amet cleric",
  },
  {
    name: "Barbarian1",
    src: "/classes/Barbarian1.png",
    description: "Lorem ipsum solar sit amet cleric",
  },
  {
    name: "Barbarian2",
    src: "/classes/Barbarian2.png",
    description: "Lorem ipsum solar sit amet cleric",
  },
  {
    name: "Barbarian3",
    src: "/classes/Barbarian3.png",
    description: "Lorem ipsum solar sit amet cleric",
  },
  {
    name: "Druid1",
    src: "/classes/Druid1.png",
    description: "Lorem ipsum solar sit amet druid",
  },
  {
    name: "Druid2",
    src: "/classes/Druid2.png",
    description: "Lorem ipsum solar sit amet druid",
  },
  {
    name: "Druid3",
    src: "/classes/Druid3.png",
    description: "Lorem ipsum solar sit amet druid",
  },
  {
    name: "BloodMage1",
    src: "/classes/BloodMage1.png",
    description: "Lorem ipsum solar sit amet druid",
  },
  {
    name: "BloodMage2",
    src: "/classes/BloodMage2.png",
    description: "Lorem ipsum solar sit amet druid",
  },
  {
    name: "BloodMage3",
    src: "/classes/BloodMage3.png",
    description: "Lorem ipsum solar sit amet druid",
  },
  {
    name: "Bard1",
    src: "/classes/Bard1.png",
    description: "Lorem ipsum solar sit amet druid",
  },
  {
    name: "Bard2",
    src: "/classes/Bard2.png",
    description: "Lorem ipsum solar sit amet druid",
  },
  {
    name: "Bard3",
    src: "/classes/Bard3.png",
    description: "Lorem ipsum solar sit amet druid",
  },
];

interface ClassesProps {
  playerClass: string;
  setPlayerClass: any; // TODO: Fix this type to extend enum
}

export default function Classes({ playerClass, setPlayerClass }: ClassesProps) {
  return (
    <main className="grid grid-cols-3 gap-7">
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
            <div className="text-center">
              <Image
                src={src}
                alt={className}
                onClick={() => setPlayerClass(className)}
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
