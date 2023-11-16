"use client";
import Image from "next/image";
import clsx from "clsx";
import { useState } from "react";

const classes = [
  {
    name: "cleric1",
    src: "/classes/cleric1.jpg",
  },
  {
    name: "cleric2",
    src: "/classes/cleric2.jpg",
  },
  {
    name: "druid1",
    src: "/classes/druid1.jpg",
  },
  {
    name: "fighter1",
    src: "/classes/fighter1.jpg",
  },
  {
    name: "paladin1",
    src: "/classes/paladin1.jpg",
  },
  {
    name: "rogue1",
    src: "/classes/rogue1.jpg",
  },
  {
    name: "rogue2",
    src: "/classes/rogue2.jpg",
  },
  {
    name: "warrior1",
    src: "/classes/warrior1.jpg",
  },
  {
    name: "wizard1",
    src: "/classes/wizard1.jpg",
  },
  {
    name: "wizard2",
    src: "/classes/wizard2.jpg",
  },
];

export default function Abilities() {
  const [chosenClass, setChosenClass] = useState("cleric2");
  return (
    <main className="grid grid-cols-4 gap-7">
      {classes.map((classType: any) => {
        const className = classType.name;
        const src = classType.src;
        return (
          <div className="text-center">
            <Image
              key={className}
              src={src}
              alt={className}
              onClick={() => setChosenClass(className)}
              className={clsx(
                "rounded-full",
                className === chosenClass &&
                  "border-2 drop-shadow-2xl animate-bounce border-purple-600"
              )}
              width={150}
              height={150}
              draggable="false"
            />
            <h1>{className}</h1>
          </div>
        );
      })}
    </main>
  );
}
