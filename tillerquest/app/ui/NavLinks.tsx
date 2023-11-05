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

const links = [
  {
    name: "Action",
    href: "/action",
    icon: faBolt,
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
    name: "Login",
    href: "/login",
    icon: faRightToBracket,
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {/* The following code can be exanded to include icons */}
      {links.map((link) => {
        const icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx("flex gap-1.5 items-center", {
              "flex text-purple-400": pathname === link.href,
            })}
          >
            <FontAwesomeIcon icon={icon} className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
