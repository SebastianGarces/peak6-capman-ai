"use client";

import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function ScenarioAnalytics({ data }: { data?: any[] }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="mb-4 text-sm font-medium text-foreground">Scenario Analytics</h3>
      {(!data || data.length === 0) ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No scenario data available yet</p>
      ) : (
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {data.map((d, i) => {
            const passRate = d.passRate ?? 0;
            const barColor =
              passRate >= 80 ? "bg-emerald-500" :
              passRate >= 60 ? "bg-amber-500" :
              "bg-red-500";

            return (
              <motion.div key={i} variants={staggerItem} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground truncate flex-1 pr-2">{d.name}</span>
                  <span className={`font-mono text-sm font-medium ${
                    passRate >= 80 ? "text-emerald-400" :
                    passRate >= 60 ? "text-amber-400" :
                    "text-red-400"
                  }`}>
                    {passRate}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${barColor} transition-all`}
                    style={{ width: `${passRate}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
