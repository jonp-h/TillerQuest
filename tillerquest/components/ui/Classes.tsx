"use client";
import Image from "next/image";
import clsx from "clsx";
import { useState } from "react";

const classes = [
  {
    name: "Cleric1",
    src: "/classes/cleric1.jpg",
  },
  {
    name: "Cleric2",
    src: "/classes/cleric2.jpg",
  },
  {
    name: "Druid1",
    src: "/classes/druid1.jpg",
  },
  {
    name: "Fighter1",
    src: "/classes/fighter1.jpg",
  },
  {
    name: "Fighter2",
    src: "/classes/fighter2.jpg",
  },
  {
    name: "Paladin1",
    src: "/classes/paladin1.jpg",
  },
  {
    name: "Rogue1",
    src: "/classes/rogue1.jpg",
  },
  {
    name: "Rogue2",
    src: "/classes/rogue2.jpg",
  },
  {
    name: "Rogue3",
    src: "/classes/rogue3.jpg",
  },
  {
    name: "Warrior1",
    src: "/classes/warrior1.jpg",
  },
  {
    name: "Warrior2",
    src: "/classes/warrior2.jpg",
  },
  {
    name: "Warrior3",
    src: "/classes/warrior3.jpg",
  },
  {
    name: "Wizard1",
    src: "/classes/wizard1.jpg",
  },
  {
    name: "Wizard2",
    src: "/classes/wizard2.jpg",
  },
  {
    name: "Mage1",
    src: "/classes/mage1.jpg",
  },
];

export default function Classes(props: any) {
  return (
    <main className="grid grid-cols-2 md:grid-cols-5 gap-7">
      {classes.map((classType) => {
        const className = classType.name;
        const src = classType.src;
        return (
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
        );
      })}
    </main>
  );
}
