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
    name: "fighter2",
    src: "/classes/fighter2.jpg",
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
    name: "rogue3",
    src: "/classes/rogue3.jpg",
  },
  {
    name: "warrior1",
    src: "/classes/warrior1.jpg",
  },
  {
    name: "warrior2",
    src: "/classes/warrior2.jpg",
  },
  {
    name: "warrior3",
    src: "/classes/warrior3.jpg",
  },
  {
    name: "wizard1",
    src: "/classes/wizard1.jpg",
  },
  {
    name: "wizard2",
    src: "/classes/wizard2.jpg",
  },
  {
    name: "mage1",
    src: "/classes/mage1.jpg",
  },
];

export default function Classes() {
  const [chosenClass, setChosenClass] = useState("cleric1");
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
              onClick={() => setChosenClass(className)}
              className={clsx(
                "rounded-full shadow-inner shadow-black",
                className === chosenClass &&
                  " border-2 shadow-inner shadow-black border-purple-600 "
              )}
              width={200}
              height={150}
              draggable="false"
            />
            <h1
              className={clsx(
                "text-2xl pt-1",
                className === chosenClass && "text-purple-400 font-bold"
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
