"use client";

import { Typography } from "@mui/material";
import { motion } from "motion/react";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  }),
};

const CLASSES = [
  { name: "Wizard", img: "/classes/Wizard1.png", rotate: -6 },
  { name: "Barbarian", img: "/classes/Barbarian4.png", rotate: -4 },
  { name: "Bard", img: "/classes/Bard1.png", rotate: 0 },
  { name: "Druid", img: "/classes/Druid4.png", rotate: 3 },
  { name: "Fighter", img: "/classes/Fighter3.png", rotate: 5 },
  { name: "Warlock", img: "/classes/Warlock1.png", rotate: 8 },
];

export default function ClassCreationSection() {
  return (
    <section className="relative w-full py-28 px-6">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          className="flex flex-col items-start gap-5 text-left"
        >
          <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-secondary uppercase">
            Character creation
          </span>
          <Typography
            variant="h3"
            component="h2"
            fontWeight={800}
            sx={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.85))" }}
          >
            Roll up a class worthy of legend
          </Typography>
          <Typography
            variant="h6"
            component="p"
            fontWeight={400}
            sx={{
              color: "text.secondary",
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            Every adventure starts with a character sheet. Pick a class straight
            out of your favourite high-fantasy tabletop &mdash; Wizard,
            Barbarian, Bard, Druid, Fighter, or Warlock &mdash; each with its
            own playstyle, strengths and abilities to grow into.
          </Typography>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          custom={0.15}
          className="relative flex h-72 items-center justify-center"
        >
          {CLASSES.map((c, i) => (
            <motion.div
              key={c.name}
              className="absolute w-36 overflow-hidden rounded-xl border border-white/10 shadow-2xl"
              style={{
                rotate: c.rotate,
                left: `calc(50% - 4.5rem + ${(i - 2) * 55}px)`,
              }}
              whileHover={{ rotate: 0, scale: 1.08, zIndex: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <Image
                src={c.img}
                alt={c.name}
                width={144}
                height={192}
                className="h-48 w-36 object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center">
                <Typography variant="caption" fontWeight={600}>
                  {c.name}
                </Typography>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
