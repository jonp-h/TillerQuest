import { redirectIfNewOrInactiveUser } from "@/lib/redirectUtils";
import { Typography } from "@mui/material";
import Image from "next/image";
import IntroSection from "@/components/landing/IntroSection";
import ClassCreationSection from "@/components/landing/ClassCreationSection";
import GuildSection from "@/components/landing/GuildSection";
import ExperienceSection from "@/components/landing/ExperienceSection";
import ManaSection from "@/components/landing/ManaSection";
import AbilitiesSection from "@/components/landing/AbilitiesSection";
import HealthSection from "@/components/landing/HealthSection";
import MinigamesSection from "@/components/landing/MinigamesSection";
import CustomizationSection from "@/components/landing/CustomizationSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import { ArrowDownward } from "@mui/icons-material";

export default async function Home() {
  await redirectIfNewOrInactiveUser();

  return (
    <main className="relative w-screen overflow-hidden">
      <div className="relative bg-radial from-tqblue via-transparent to-transparent w-screen min-h-screen overflow-hidden">
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
              src="/TillerQuestLogoVertical.svg"
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
        <ArrowDownward className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 animate-bounce" />
      </div>
      <IntroSection />
      <ClassCreationSection />
      <GuildSection />
      <ExperienceSection />
      <ManaSection />
      <AbilitiesSection />
      <HealthSection />
      <MinigamesSection />
      <CustomizationSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}
