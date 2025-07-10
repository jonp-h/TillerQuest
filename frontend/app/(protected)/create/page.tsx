import React from "react";
import CreateUserForm from "./_components/CreateUserForm";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CreatePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user.role !== "NEW") {
    redirect("/"); // Redirect if the user is not a new user
  }
  return (
    <div>
      <CreateUserForm />
    </div>
  );
}
