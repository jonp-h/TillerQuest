import MainContainer from "@/components/MainContainer";
import { getLastMana, getUserById } from "@/data/user/getUser";
import { Paper, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import Image from "next/image";
import ManaForm from "./_components/ManaForm";
import { redirectIfNotActiveUser } from "@/lib/redirectUtils";

export default async function ManaPage() {
  const session = await redirectIfNotActiveUser();

  if (!session?.user.id) {
    return null;
  }

  const user = await getLastMana(session.user.id);

  if (!user) {
    notFound();
  }

  const currentDate = new Date();

  async function checkIfWeekend() {
    const dayOfWeek = currentDate.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  const isWeekend = await checkIfWeekend();

  return (
    <MainContainer>
      <Paper
        elevation={3}
        className="m-3 w-1/3 mx-auto p-5 flex flex-col gap-5 items-center text-center justify-center"
      >
        <Typography
          variant="h3"
          component={"h1"}
          align="center"
          fontWeight={600}
        >
          The Magical Forest
        </Typography>
        <Image
          src="/mana.jpg"
          className="rounded-full"
          alt="mana"
          width={400}
          height={400}
        />
        <Typography variant="h5" component={"h2"} align="center">
          You attempt to attune to the magic around you
        </Typography>
        <ManaForm user={user} currentDate={currentDate} isWeekend={isWeekend} />
      </Paper>
    </MainContainer>
  );
}
