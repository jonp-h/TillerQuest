"use client";
import React, { useState } from "react"; // Import React and useState
import { julius_Sans_One } from "../../app/fonts";
import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faEye } from "@fortawesome/free-solid-svg-icons";
import UserNavContainer from "./UserNavContainer";

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Initialize state

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen); // Toggle the state
  };

  return (
    <>
      <nav className="flex w-full place-content-between items-center bg-gradient-to-r from-slate-800 to-slate-950">
        <Link href="/">
          <div className="flex items-center py-2 pl-10">
            <Image
              className="drop-shadow-[0_0_0.4rem_#ffffff70]"
              src="/logo/TQ.png"
              alt="Tiller Quest logo"
              width={45}
              height={150}
            />
            <div className={julius_Sans_One.className}>
              <h1 className="pl-8 font-bold text-sm md:text-xl lg:text-3xl ">
                Tiller Quest
              </h1>
            </div>
          </div>
        </Link>

        <div className="hiddens md:sticky  md:flex gap-5 text-lg justify-between pr-10">
          <NavLinks />
        </div>
        <div className="flex gap-5 md:mr-3">
          <UserNavContainer />
        </div>

        {/* Visible hamburger menu on small screen sizes */}
        <div className="block md:hidden pr-5 cursor-pointer">
          <FontAwesomeIcon icon={faBars} onClick={toggleMobileMenu} />{" "}
        </div>
      </nav>
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden" // Conditional class based on state
        } sticky z-10 md:hidden pr-5 flex flex-col items-center pt-10 gap-20 text-4xl min-w-full min-h-screen bg-slate-900`}
      >
        {/* TODO: implement mobile notification switching screen, or just use navbar*/}
        {/* <UserNavContainer switchFont={switchFont} /> */}
        <NavLinks onClick={() => isMobileMenuOpen && toggleMobileMenu()} />
      </div>
    </>
  );
}
