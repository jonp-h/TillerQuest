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

const DAYS = ["M", "T", "W", "T", "F"];

export default function ManaSection() {
  return (
    <section className="relative w-full py-28 px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <motion.span
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={fadeUp}
          className="rounded-full border border-mana/40 bg-mana/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-mana uppercase"
        >
          Mana
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
            Show up, power up
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
            Just for showing up to class, you earn 1&ndash;5 mana a day &mdash;
            Wizards even get a +2 bonus. Bank it up, because mana is what fuels
            every ability in your arsenal.
          </Typography>
        </motion.div>

        <div className="mt-4 flex items-center gap-3">
          {DAYS.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
              className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-mana/50 bg-mana/15"
            >
              <Typography variant="caption" fontWeight={700}>
                {d}
              </Typography>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, delay: 0.3 + DAYS.length * 0.12 }}
            className="ml-2 rounded-full bg-mana px-3 py-1.5"
          >
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: "#0d1117" }}
            >
              +5 mana
            </Typography>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
