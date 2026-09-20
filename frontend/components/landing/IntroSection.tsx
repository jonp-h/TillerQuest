"use client";

import { Typography } from "@mui/material";
import { motion } from "motion/react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  }),
};

export default function IntroSection() {
  return (
    <section className="relative w-full overflow-hidden py-32 px-6">
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          custom={0}
          variants={fadeUp}
          className="flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5"
        >
          <Typography
            variant="overline"
            sx={{ letterSpacing: 2, color: "secondary.main" }}
          >
            Built by students &amp; teachers
          </Typography>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          custom={0.1}
          variants={fadeUp}
        >
          <Typography
            variant="h2"
            component="h1"
            fontWeight={800}
            className="bg-linear-to-b from-white to-tqwhite/70 bg-clip-text text-transparent"
            sx={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.85))" }}
          >
            What is TillerQuest?
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
              maxWidth: "42rem",
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            TillerQuest turns the everyday classroom into a living{" "}
            <span className="text-secondary font-semibold">
              high-fantasy adventure
            </span>
            . Dreamed up by students and built together with teachers, it
            rewards curiosity, effort and good behaviour with the kind of
            progression you&apos;d expect from your favourite RPG &mdash; not a
            spreadsheet.
          </Typography>
        </motion.div>
      </div>
    </section>
  );
}
