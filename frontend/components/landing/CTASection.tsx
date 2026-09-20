"use client";

import { Typography, Button } from "@mui/material";
import { motion } from "motion/react";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  }),
};

export default function CTASection() {
  return (
    <section className="relative w-full py-32 px-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={fadeUp}
        >
          <Typography
            variant="h3"
            component="h2"
            fontWeight={800}
            sx={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.85))" }}
          >
            Sounds awesome?
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
            variant="h6"
            component="p"
            fontWeight={400}
            sx={{
              color: "text.secondary",
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            Your class, your character, your adventure. All it takes is one
            sign-up &mdash; and a GitHub account, but we promise that&apos;s
            worth it too.
          </Typography>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          custom={0.2}
          variants={fadeUp}
          className="mt-2"
        >
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            color="secondary"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 4, py: 1.5, fontWeight: 700 }}
          >
            Sign up here
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
