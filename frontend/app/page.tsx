import { redirectIfNewUser } from "@/lib/redirectUtils";
import { Typography } from "@mui/material";
import Image from "next/image";

export default async function Home() {
  await redirectIfNewUser();

  return (
    <main className=" bg-radial from-tqblue via-transparent to-transparent w-screen min-h-screen">
      <div className="w-screen flex justify-center text-center">
        <div className="mt-48 flex flex-col gap-30 items-center text-6xl">
          <video
            autoPlay
            muted
            loop
            className="min-w-screen min-h-full absolute -top-40 -z-10"
          >
            <source src="TQLanding.mp4" type="video/mp4" />
          </video>
          <Image
            src="TillerQuestLogoVertical.svg"
            alt="TillerQuest"
            width={500}
            height={500}
            draggable={false}
          />
          <Typography variant="h5" component={"h2"} fontWeight={"600"}>
            For students and teachers,
            <br />
            by students and teachers
          </Typography>
        </div>
      </div>
    </main>
  );
}
