import { auth } from "@/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  return (
    <main className=" bg-gradient-to-b from-indigo-900 to-purple-950 w-screen min-h-screen">
      <div className="w-screen flex justify-center text-center">
        <div className="mt-36 grid gap-6 text-6xl">
          <Image src="/TQlogo.png" alt="TillerQuest" width={300} height={300} />
          <h1>TillerQuest</h1>
          <p>{session ? session.user?.role : "Not logged in"}</p>
          <p>{session ? session.user?.class : "Not logged in"}</p>
          <p>
            {session
              ? session.user?.name +
                session.user.username +
                session.user.lastname
              : "Not logged in"}
          </p>
          <p>
            TillerQuest uses OAuth to confirm your identity through other
            services. When you log in, you only ever give your credentials to
            that service - never to TillerQuest. Then, the service you use tells
            the TillerQuest servers that you&apos;re really you. In general,
            this reveals no information about you beyond what is already public;
            here are examples from GitHub
            (https://api.github.com/users/octocat). TillerQuest will remember
            your unique ID, names, URL, and image from the service you use to
            authenticate.
          </p>
        </div>
      </div>
    </main>
  );
}
