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

const MEMBERS = [
  "/classes/Wizard2.png",
  "/classes/Bard2.png",
  "/classes/Druid2.png",
  "/classes/Fighter2.png",
  "/classes/Warlock2.png",
  "/classes/Barbarian2.png",
];

export default function GuildSection() {
  return (
    <section className="relative w-full py-28 px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <motion.span
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={fadeUp}
          className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-secondary uppercase"
        >
          Guilds
        </motion.span>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          custom={0.1}
          variants={fadeUp}
        >
          <Typography
            variant="h3"
            component="h2"
            fontWeight={800}
            sx={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.85))" }}
          >
            Stronger, together
          </Typography>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          custom={0.2}
          variants={fadeUp}
        >
          <Typography
            variant="h6"
            component="p"
            fontWeight={400}
            sx={{
              color: "text.secondary",
              maxWidth: "38rem",
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            No adventurer stands alone. Team up with your classmates in a guild
            and take on the term together &mdash; sharing progress, celebrating
            wins and covering for each other when things go wrong.
          </Typography>
        </motion.div>

        <div className="mt-4 flex items-center">
          {MEMBERS.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
              className="-ml-4 first:ml-0"
            >
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-background ring-2 ring-secondary/50">
                <Image
                  src={src}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.3 + MEMBERS.length * 0.08 }}
            className="-ml-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-background bg-primary/20 ring-2 ring-secondary/50"
          >
            <Typography variant="body2" fontWeight={700}>
              +24
            </Typography>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
