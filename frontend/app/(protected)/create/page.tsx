import React from "react";
import CreateUserForm from "./_components/CreateUserForm";
import { requireNewUser } from "@/lib/redirectUtils";

export default async function CreatePage() {
  await requireNewUser();
  return (
    <div>
      <CreateUserForm />
    </div>
  );
}
