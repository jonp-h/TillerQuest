"use client";
import Image from "next/image";
import clsx from "clsx";
import { Tooltip, Zoom } from "@mui/material";

const classes = [
  {
    name: "Wizard",
    src: "/classes/wizard.jpg",
    description: "Lorem ipsum solar sit amet cleric",
  },
  {
    name: "Barbarian",
    src: "/classes/barbarian.jpg",
    description: "Lorem ipsum solar sit amet cleric",
  },
  {
    name: "Druid",
    src: "/classes/druid.jpg",
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
                    " border-4 shadow-inner shadow-black border-purple-600 "
                )}
                width={200}
                height={150}
                draggable="false"
              />
              <h1
                className={clsx(
                  "text-2xl pt-1",
                  className === playerClass && "text-purple-400 font-bold"
                )}
              >
                {className}
              </h1>
            </div>
          </Tooltip>
        );
      })}
    </main>
  );
}
