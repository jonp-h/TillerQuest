import React from "react";
import CreateUserForm from "./_components/CreateUserForm";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export default async function CreatePage() {
  const session = await auth();
  return (
    <div>
      <SessionProvider session={session}>
        <CreateUserForm />
        {JSON.stringify(session?.user)}
      </SessionProvider>
    </div>
  );
}
