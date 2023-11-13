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
  faStore,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

const links = [
  {
    name: "Åsgard",
    href: "/asgard",
    icon: faBolt,
  },
  {
    name: "Shop",
    href: "/shop",
    icon: faStore,
  },
  {
    name: "Explore",
    href: "/explore",
    icon: faMagnifyingGlass,
  },
  {
    name: "About Us",
    href: "/about-us",
    icon: faPaperPlane,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: faUser,
  },
  {
    href: "/notifications",
    icon: faBell,
  },
  {
    name: "Login",
    href: "/login",
    icon: faRightToBracket,
  },
];

interface NavLinksProps {
  onClick?: (event: React.MouseEvent) => void;
}

export default function NavLinks({ onClick }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx("flex gap-1.5 items-center", {
              "flex text-purple-400": pathname === link.href,
            })}
            onClick={onClick}
          >
            <FontAwesomeIcon icon={icon} className="w-6 " />
            <p className="">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
