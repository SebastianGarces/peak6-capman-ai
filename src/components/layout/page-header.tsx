"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { fadeInUp } from "@/lib/motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <motion.div
      className="mb-6"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-7 w-7 text-primary" />}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-2 h-0.5 w-30 rounded-full gradient-primary-btn" />
    </motion.div>
  );
}
