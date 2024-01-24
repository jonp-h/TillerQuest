"use client";
import React, { useState } from "react"; // Import React and useState
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  faBell,
  faEye,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export default function UserNavContainer({
  switchFont,
}: {
  switchFont: () => void;
}) {
  const pathname = usePathname();
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
      <Link href={"/login"} className="flex gap-1.5 items-center">
        <FontAwesomeIcon icon={faRightFromBracket} className="w-6 " />
        <p>Login</p>
      </Link>
    </>
  );
}
