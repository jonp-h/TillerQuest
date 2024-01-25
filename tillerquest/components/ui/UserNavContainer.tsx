import React, { useState } from "react"; // Import React and useState
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  faBell,
  faEye,
  faRightFromBracket,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useCurrentUser } from "@/hooks/use-current-user";
import { signOut } from "next-auth/react";

export default function UserNavContainer({
  switchFont,
}: {
  switchFont: () => void;
}) {
  const user = useCurrentUser();

  const logout = () => {
    signOut();
  };

  return (
    <>
      <div>
        <FontAwesomeIcon
          className="w-5 hover:cursor-pointer"
          icon={faEye}
          onClick={switchFont}
        />
      </div>

      <Link href={"/notifications"} className="flex gap-1.5 items-center">
        <FontAwesomeIcon icon={faBell} className="w-6 " />
      </Link>

      {user ? (
        <Link onClick={logout} href={"/"} className="flex gap-1.5 items-center">
          <FontAwesomeIcon icon={faRightFromBracket} className="w-6 " />
          <p>Sign out</p>
        </Link>
      ) : (
        <Link href={"/auth/login"} className="flex gap-1.5 items-center">
          <FontAwesomeIcon icon={faRightToBracket} className="w-6 " />
          <p>Sign in</p>
        </Link>
      )}
    </>
  );
}
