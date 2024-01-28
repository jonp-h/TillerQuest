"use client";
import { auth } from "@/auth";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

export default function Create() {
  const { update } = useSession();

  const router = useRouter();

  // updates the user with the role of USER
  const createUser = async () => {
    update({ role: "USER" });
    // necessary refreshes before redirecting to profile
    getSession();
    router.refresh();
    await update().then(() => {
      router.push("profile");
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <button onClick={createUser}>Click to create user</button>
    </main>
  );
}
