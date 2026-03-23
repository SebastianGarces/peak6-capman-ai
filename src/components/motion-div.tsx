"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";

export const MotionDiv = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function MotionDiv(props, ref) {
    return <motion.div ref={ref} {...props} />;
  }
);
