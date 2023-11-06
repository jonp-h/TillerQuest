"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faMagnifyingGlass,
  faUser,
  faRightToBracket,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

const abilities = [
  {
    name: "Thunder",
    href: "/thunder",
    icon: faBolt,
  },
  {
    name: "Explore",
    href: "/explore",
    icon: faMagnifyingGlass,
  },
  {
    name: "Fly",
    href: "/fly",
    icon: faPaperPlane,
  },
  {
    name: "Shapeshift",
    href: "/shapeshift",
    icon: faUser,
  },
  {
    name: "Thunder",
    href: "/thunder",
    icon: faBolt,
  },
  {
    name: "Thunder",
    href: "/thunder",
    icon: faBolt,
  },
  {
    name: "Thunder",
    href: "/thunder",
    icon: faBolt,
  },
  {
    name: "Thunder",
    href: "/thunder",
    icon: faBolt,
  },
  {
    name: "Thunder",
    href: "/thunder",
    icon: faBolt,
  },
];

export default function Abilities() {
  return (
    <>
      {/* The following code can be exanded to include icons */}
      {abilities.map((abilities) => {
        const icon = abilities.icon;
        return (
          <Link
            key={abilities.name}
            href={abilities.href}
            className="flex flex-col gap-3 hover:text-purple-600 hover:border-purple-600 border-white border-2 rounded-lg p-3 items-center"
          >
            <FontAwesomeIcon icon={icon} className=" h-10" />
            <p>{abilities.name}</p>
          </Link>
        );
      })}
    </>
  );
}
