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

const XP_EVENTS = [
  { label: "Nailed the test", xp: 500 },
  { label: "Helped a classmate", xp: 50 },
  { label: "Pop quiz champion", xp: 200 },
];

export default function ExperienceSection() {
  return (
    <section className="relative w-full py-28 px-6">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          className="order-2 flex flex-col items-start gap-5 text-left md:order-1"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/60 p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <Typography variant="subtitle2" fontWeight={700}>
                Level 12
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                3,240 / 4,000 XP
              </Typography>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-experience"
                initial={{ width: 0 }}
                whileInView={{ width: "81%" }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              />
            </div>

            <div className="mt-5 flex flex-col gap-2">
              {XP_EVENTS.map((e, i) => (
                <motion.div
                  key={e.label}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                  className="flex items-center justify-between rounded-lg bg-experience/10 px-3 py-2"
                >
                  <Typography variant="body2">{e.label}</Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    className="text-experience"
                  >
                    +{e.xp} XP
                  </Typography>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          custom={0.1}
          className="order-1 flex flex-col items-start gap-5 text-left md:order-2"
        >
          <span className="rounded-full border border-experience/40 bg-experience/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-experience uppercase">
            Experience
          </span>
          <Typography
            variant="h3"
            component="h2"
            fontWeight={800}
            sx={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.85))" }}
          >
            Level up by learning
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
            Every test aced, question answered and good deed done earns you
            experience. Aid your guildmates, level up together, and watch your
            party grow stronger &mdash; one lesson at a time.
          </Typography>
        </motion.div>
      </div>
    </section>
  );
}
