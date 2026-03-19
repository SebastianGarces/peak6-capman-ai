import type { Variants, Transition } from "motion/react";

// Shared easing — cubic bezier tuple
const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Fade in from below — use on individual elements or as stagger child
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

// Stagger container — wrap children that use fadeInUp/staggerItem
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

// Stagger item — identical to fadeInUp, named for clarity inside containers
export const staggerItem = fadeInUp;

// Scale in with spring — modals, popups, toasts
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// Progress bar fill — spring-based width animation
export const progressFillTransition: Transition = {
  type: "spring",
  stiffness: 50,
  damping: 15,
  mass: 1,
};

// Slide in from left — sidebar, panels
export const slideInLeft: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    x: "-100%",
    transition: { duration: 0.2, ease: easeOut },
  },
};

// Overlay fade
export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
