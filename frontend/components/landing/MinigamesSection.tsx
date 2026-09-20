"use client";

import { Typography } from "@mui/material";
import { motion } from "motion/react";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import CalculateIcon from "@mui/icons-material/Calculate";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  }),
};

const GAMES = [
  { name: "Typing Speed", icon: KeyboardIcon, gold: 670 },
  { name: "Boolean Logic", icon: CalculateIcon, gold: 523 },
  { name: "...and more", icon: SportsEsportsIcon, gold: 9001 },
];

export default function MinigamesSection() {
  return (
    <section className="relative w-full py-28 px-6">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <motion.span
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={fadeUp}
          className="rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-gold uppercase"
        >
          Minigames
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
            Learn by playing
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
              maxWidth: "40rem",
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            Not everything worth learning fits in a lesson plan. Sharpen
            real-world skills like typing speed or boolean logic in bite-sized
            minigames &mdash; and get paid in gold for your trouble.
          </Typography>
        </motion.div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {GAMES.map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                className="relative flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-6 py-5"
              >
                <Icon sx={{ color: "gold.main", fontSize: 32 }} />
                <Typography variant="body2" fontWeight={600}>
                  {g.name}
                </Typography>
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.12 }}
                  className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold"
                >
                  +{g.gold} gold
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
