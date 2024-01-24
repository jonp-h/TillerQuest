"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faUser } from "@fortawesome/free-solid-svg-icons";

const placeholderPlayers = [
  {
    name: "ola",
    href: "/Ola",
    class: faUser,
  },
  {
    name: "ola",
    href: "/ola",
    class: faUser,
  },
  {
    name: "ola",
    href: "/ola",
    class: faUser,
  },
  {
    name: "ola",
    href: "/ola",
    class: faUser,
  },
  {
    name: "ola",
    href: "/ola",
    class: faUser,
  },
  {
    name: "ola",
    href: "/ola",
    class: faUser,
  },
];

export default function Abilities() {
  return (
    <>
      {/* The following code can be exanded to include icons */}
      {placeholderPlayers.map((abilities) => {
        const icon = abilities.class;
        return (
          <Link
            key={abilities.name}
            href={abilities.href}
            className="flex flex-col gap-3 hover:text-purple-600 hover:border-purple-600 border-white border-2 rounded-lg p-3 items-center"
          >
            <FontAwesomeIcon icon={icon} className=" h-10" />
            <p>{abilities.name}</p>
            <input type="number" className="bg-slate-600 w-20" />
          </Link>
        );
      })}
    </>
  );
}
