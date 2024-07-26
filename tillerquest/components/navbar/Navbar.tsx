import React from "react";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import NavbarContent from "./NavbarContent";

export default async function Navbar() {
  const session = await auth();
  return (
    <div className="text-lg fixed items-center flex flex-grow-1 p-3 w-screen z-10 bg-indigo-950">
      <SessionProvider session={session}>
        <NavbarContent />
      </SessionProvider>
    </div>
  );
}
