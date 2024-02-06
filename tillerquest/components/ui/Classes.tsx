"use client";
import Image from "next/image";
import clsx from "clsx";
import { useState } from "react";
import { Tooltip, Zoom } from "@mui/material";

const classes = [
  {
    name: "Cleric1",
    src: "/classes/cleric1.jpg",
    description: "Lorem ipsum solar sit amet cleric",
  },
  {
    name: "Cleric2",
    src: "/classes/cleric2.jpg",
    description: "Lorem ipsum solar sit amet cleric",
  },
  {
    name: "Druid1",
    src: "/classes/druid1.jpg",
    description: "Lorem ipsum solar sit amet druid",
  },
  {
    name: "Fighter1",
    src: "/classes/fighter1.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Fighter2",
    src: "/classes/fighter2.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Paladin1",
    src: "/classes/paladin1.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Rogue1",
    src: "/classes/rogue1.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Rogue2",
    src: "/classes/rogue2.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Rogue3",
    src: "/classes/rogue3.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Warrior1",
    src: "/classes/warrior1.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Warrior2",
    src: "/classes/warrior2.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Warrior3",
    src: "/classes/warrior3.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Wizard1",
    src: "/classes/wizard1.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Wizard2",
    src: "/classes/wizard2.jpg",
    description: "Lorem ipsum solar sit amet",
  },
  {
    name: "Mage1",
    src: "/classes/mage1.jpg",
    description: "Lorem ipsum solar sit amet",
  },
];

export default function Classes(props: any) {
  return (
    <main className="grid grid-cols-2 md:grid-cols-5 gap-7">
      {classes.map((classType) => {
        const className = classType.name;
        const src = classType.src;
        const description = classType.description;
        return (
          <Tooltip
            TransitionComponent={Zoom}
            TransitionProps={{ timeout: 600 }}
            title={description}
            arrow
          >
            <div key={className} className="text-center">
              <Image
                src={src}
                alt={className}
                onClick={() => props.setPlayerClass(className)}
                className={clsx(
                  "rounded-full shadow-inner shadow-black",
                  className === props.playerClass &&
                    " border-4 shadow-inner shadow-black border-purple-600 "
                )}
                width={200}
                height={150}
                draggable="false"
              />
              <h1
                className={clsx(
                  "text-2xl pt-1",
                  className === props.playerClass && "text-purple-400 font-bold"
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
