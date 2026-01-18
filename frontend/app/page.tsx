import { redirectIfNewOrInactiveUser } from "@/lib/redirectUtils";
import { Typography } from "@mui/material";
import Image from "next/image";

export default async function Home() {
  await redirectIfNewOrInactiveUser();

  return (
    <main className="relative bg-radial from-tqblue via-transparent to-transparent w-screen min-h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="TQLanding.mp4" type="video/mp4" />
      </video>
      <div className="w-screen flex justify-center text-center">
        <div className="mt-48 flex flex-col gap-30 items-center text-6xl">
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
