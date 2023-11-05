"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Action",
    href: "/action",
    //icon: HomeIcon
  },
  {
    name: "Explore",
    href: "/explore",
    // icon: DocumentDuplicateIcon,
  },
  {
    name: "About Us",
    href: "/about-us",
    //icon: UserGroupIcon
  },
  {
    name: "Profile",
    href: "/profile",
    //icon: UserGroupIcon
  },
  {
    name: "Login",
    href: "/login",
    //icon: UserGroupIcon
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {/* The following code can be exanded to include icons */}
      {links.map((link) => {
        // const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx("", {
              "text-purple-400 font-extrabold": pathname === link.href,
            })}
          >
            {/* <LinkIcon className="w-6" /> */}
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
