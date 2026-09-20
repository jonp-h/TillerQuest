"use client";

import { Typography } from "@mui/material";
import { motion } from "motion/react";
import Image from "next/image";
import RarityText from "../RarityText";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  }),
};

const COSMETICS = [
  { name: "image", src: "/items/dice_silver.png" },
  { name: "image", src: "/items/dice_black_sun.png" },
  { name: "image", src: "/items/lab.png" },
  { name: "image", src: "/items/playstation.png" },
  { name: "text", src: "Javascript Ninja" },
  { name: "text", src: "Legend" },
];

export default function CustomizationSection() {
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
          <span className="rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-gold uppercase">
            Customization
          </span>
          <Typography
            variant="h3"
            component="h2"
            fontWeight={800}
            sx={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.85))" }}
          >
            Make your gold count
          </Typography>
          <Typography
            variant="h6"
            component="div"
            fontWeight={400}
            sx={{
              color: "text.secondary",
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            Spend it in the shop to stand out &mdash; new dice skins,{" "}
            <RarityText rarity="legendary" width="fit">
              titles
            </RarityText>{" "}
            and cosmetics to make your character (and your rolls) truly yours.
          </Typography>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          {COSMETICS.map((src, i) => (
            <motion.div
              key={src.src}
              initial={{ opacity: 0, y: 20, scale: 0.85 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              whileHover={{ scale: 1.08, y: -4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-5"
            >
              {src.name === "image" && (
                <Image src={src.src} alt="" width={64} height={64} />
              )}
              {src.name === "text" && (
                <RarityText rarity="legendary" width="fit">
                  {src.src}
                </RarityText>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
