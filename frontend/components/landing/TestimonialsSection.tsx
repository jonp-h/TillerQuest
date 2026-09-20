"use client";

import { Typography } from "@mui/material";
import { AnimatePresence, motion } from "motion/react";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 4, delay, ease: "easeOut" as const },
  }),
};

const TESTIMONIALS = [
  {
    quote:
      "I really enjoyed coming to school because of TillerQuest. Levelling up with my guild made even a Monday morning feel worth it.",
    author: "Student, 2024",
  },
  {
    quote:
      "Watching a class go quiet because everyone is trying to gain xp together is something I never expected to see as a teacher.",
    author: "Teacher, 2026",
  },
  {
    quote:
      "TillerQuest really made me get to know my classmates. I never thought I'd be friends with the people in my class, but now we all hang out and play games after school.",
    author: "Student, 2025",
  },
  {
    quote:
      "My Wizard keeps the whole guild topped up on mana. First time group work felt like teamwork instead of a chore.",
    author: "Student, 2025",
  },
  {
    quote:
      "Rolling a death save in front of the class is somehow more motivating than any grade ever was.",
    author: "Student, 2024",
  },
  {
    quote:
      "TillerQuest opened my eyes to programming. I want to be a developer now.",
    author: "Student, 2025",
  },
  {
    quote: "Numbers go brrbrbrbrrrbrbrrr",
    author: "Student, 2025",
  },
];

const ROTATE_INTERVAL_MS = 5000;

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full py-28 px-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <motion.span
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={fadeUp}
          className="rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-secondary uppercase"
        >
          Testimonials
        </motion.span>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          custom={0.1}
          variants={fadeUp}
        >
          <FormatQuoteIcon
            sx={{ fontSize: 48, color: "secondary.main", opacity: 0.5 }}
          />
        </motion.div>

        <div className="flex min-h-32 w-full items-center justify-center sm:min-h-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-3"
            >
              <Typography
                variant="h6"
                component="p"
                fontWeight={500}
                sx={{
                  maxWidth: "38rem",
                  textShadow: "0 2px 10px rgba(0,0,0,0.9)",
                }}
              >
                &ldquo;{TESTIMONIALS[index].quote}&rdquo;
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                className="text-secondary"
              >
                {TESTIMONIALS[index].author}
              </Typography>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-2 flex items-center gap-2">
          {TESTIMONIALS.map((t, i) => (
            <motion.span
              key={t.author + i}
              className="h-1.5 rounded-full bg-secondary"
              animate={{
                width: i === index ? 24 : 8,
                opacity: i === index ? 1 : 0.3,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
