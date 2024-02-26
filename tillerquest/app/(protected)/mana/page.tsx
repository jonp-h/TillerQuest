import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { getUserById, giveMana } from "@/data/user";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@mui/material";
import ManaForm from "@/components/ui/ManaForm";

function IP() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}

export default async function Mana() {
  const session = await auth();

  let user;

  if (session) {
    user = await getUserById(session.user.id);
  }
  const day = new Date().toISOString().slice(0, 10);
  const lastMana = user?.lastMana;

  const IPRange = process.env.NEXT_PUBLIC_MIDGARD_IP?.split(",");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between md:p-16 bg-gradient-to-br from-purple-950 to-gray-950">
      <Suspense fallback={<div>Loading...</div>}>
        {IPRange?.includes(IP()) ? (
          !!user && lastMana !== day ? (
            <div className="flex flex-col md:flex-row justify-items-center md:gap-20  w-full min-h-screen md:min-h-fit md:w-auto p-10 bg-slate-900 relative md:rounded-xl md:shadow-xl ">
              <ManaForm user={user} />
            </div>
          ) : (
            <p>Come back later</p>
          )
        ) : (
          <p>
            You must enter <span className="text-orange-400">Midgard</span>
          </p>
        )}
      </Suspense>
    </main>
  );
}
