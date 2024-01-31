"use client";
import { auth } from "@/auth";
import Classes from "@/components/ui/Classes";
import { Button } from "@/components/ui/Button";
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
    <main className="flex min-h-screen flex-col gap-10 items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <Classes />
      <Button className="primary">Click me</Button>
      <button className="p-3 bg-purple-800 rounded-xl" onClick={createUser}>
        Create user
      </button>
    </main>
  );
}
