"use client";

import { motion, type Variants } from "motion/react";

// GPU-friendly transitions: opacity + translateY only (no layout-triggering props)
const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const easeIn: [number, number, number, number] = [0.55, 0, 1, 0.45];

const variants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: easeIn },
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
