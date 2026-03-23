import type { Variants, Transition } from "motion/react";

// ─── Page Transitions ───
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageTransitionConfig: Transition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

// ─── Stagger Container ───
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// ─── Stagger Item ───
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Fade In Up ───
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Scale In (Modals / Popups) ───
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// ─── Slide In (Sidebar / Drawers) ───
export const slideInLeft: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const slideInRight: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// ─── Overlay Backdrop ───
export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ─── XP Popup ───
export const xpPopup: Variants = {
  hidden: { opacity: 0, y: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    y: -20,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
  exit: {
    opacity: 0,
    y: -40,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ─── Progress Bar Fill ───
export const progressFillTransition: Transition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
};
