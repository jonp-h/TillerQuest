"use client";

import { Typography } from "@mui/material";
import { motion } from "motion/react";
import CasinoIcon from "@mui/icons-material/Casino";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  }),
};

export default function HealthSection() {
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
                HP
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                0 / 40
              </Typography>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-health"
                initial={{ width: "70%" }}
                whileInView={{ width: "1%" }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              className="mt-5 flex items-center gap-3 rounded-lg bg-health/10 px-3 py-2.5"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1.5, delay: 2.5, ease: "easeOut" }}
              >
                <CasinoIcon sx={{ color: "health.main", fontSize: 28 }} />
              </motion.div>
              <Typography variant="body2">
                HP hits 0 &mdash; time to roll a{" "}
                <span className="text-health font-semibold">death save</span>.
              </Typography>
            </motion.div>
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
          <span className="rounded-full border border-health/40 bg-health/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-health uppercase">
            Health
          </span>
          <Typography
            variant="h3"
            component="h2"
            fontWeight={800}
            sx={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.85))" }}
          >
            Actions have consequences
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
            Slack off or leave an open drink, and you&apos;ll take damage. Drop
            to 0 health and it&apos;s time to roll a death save &mdash; will you
            claw your way back, or will fate have other plans?
          </Typography>
        </motion.div>
      </div>
    </section>
  );
}
