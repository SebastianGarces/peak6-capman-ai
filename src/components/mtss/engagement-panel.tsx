"use client";

import { motion } from "motion/react";
import { Users, Calendar, BarChart3, Trophy } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface EngagementPanelProps {
  dau: number;
  wau: number;
  avgSessionsPerWeek: number;
  challengeRate: number;
}

export function EngagementPanel({ dau, wau, avgSessionsPerWeek, challengeRate }: EngagementPanelProps) {
  const stats = [
    { label: "Daily Active Users", value: dau, Icon: Users, cardClass: "stat-card-blue", iconClass: "text-blue-400" },
    { label: "Weekly Active Users", value: wau, Icon: Calendar, cardClass: "stat-card-violet", iconClass: "text-violet-400" },
    { label: "Avg Sessions/Week", value: avgSessionsPerWeek.toFixed(1), Icon: BarChart3, cardClass: "stat-card-green", iconClass: "text-green-400" },
    { label: "Challenge Rate", value: `${challengeRate}%`, Icon: Trophy, cardClass: "stat-card-gold", iconClass: "text-amber-400" },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 gap-3 md:grid-cols-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {stats.map(({ label, value, Icon, cardClass, iconClass }) => (
        <motion.div key={label} variants={staggerItem} className={`${cardClass} rounded-xl p-4`}>
          <div className="mb-2 flex items-center gap-2">
            <Icon className={`h-4 w-4 ${iconClass}`} />
          </div>
          <p className="font-mono text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
