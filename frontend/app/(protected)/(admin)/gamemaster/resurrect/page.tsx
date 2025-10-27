import MainContainer from "@/components/MainContainer";
import { getDeadUsers } from "@/data/user/getUser";
import { Typography } from "@mui/material";
import DeathCard from "./_components/DeathCard";
import Image from "next/image";
import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import ResurrectDiceProvider from "./_components/ResurrectDiceProvider";

export default async function ResurrectPage() {
  await redirectIfNotAdmin();
  const deadUsers = await getDeadUsers();

  return (
    <MainContainer>
      <ResurrectDiceProvider>
        <div className="flex flex-col justify-center items-center ">
          <div
            id="dice-canvas"
            className="fixed mt-24 z-10 inset-0 w-full h-11/12 pointer-events-none"
          />
          <Image
            className="rounded-full"
            alt="deadly-gm"
            src="/deadly-gm.jpg"
            width={400}
            height={400}
          />
          <Typography variant="h3" align="center" color="error" gutterBottom>
            Resurrect thou foolish students
          </Typography>

          <Typography variant="h5" align="center">
            But resurrection comes at a cost...
          </Typography>
          <Typography variant="h6" color="warning" align="center">
            All guildmembers must sacrifice a substantial amount of hp to bring
            the guildmate back to life
          </Typography>
        </div>
        <div className="flex flex-wrap justify-center gap-4 py-6">
          {deadUsers.map((user) => (
            <DeathCard key={user.name} user={user} />
          ))}
        </div>
      </ResurrectDiceProvider>
    </MainContainer>
  );
}
