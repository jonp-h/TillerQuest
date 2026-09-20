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

const ABILITIES = [
  { name: "Postpone", icon: "/abilities/Postpone.png" },
  { name: "Fireball", icon: "/abilities/Fireball.png" },
  { name: "Shield", icon: "/abilities/Shield.png" },
  { name: "Heal", icon: "/abilities/Heal.png" },
  { name: "Inspiration", icon: "/abilities/Inspiration.png" },
  { name: "Greater Postpone", icon: "/abilities/Greater-Postpone.png" },
];

export default function AbilitiesSection() {
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
          <span className="rounded-full border border-mana/40 bg-mana/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-mana uppercase">
            Abilities
          </span>
          <Typography
            variant="h3"
            component="h2"
            fontWeight={800}
            sx={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.85))" }}
          >
            Turn mana into magic
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
            Spend your mana on real, actual perks &mdash; postpone a hand-in,
            heal a guildmate, slice a monster, or talk your way into a coveted
            computer lab keycard. Unlock more as you level up.
          </Typography>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          {ABILITIES.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 20, scale: 0.85 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              whileHover={{ scale: 1.08, y: -4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/60 p-4 text-center"
            >
              <Image
                src={a.icon}
                alt={a.name}
                width={56}
                height={56}
                className="rounded-full"
              />
              <Typography variant="caption" fontWeight={600}>
                {a.name}
              </Typography>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
