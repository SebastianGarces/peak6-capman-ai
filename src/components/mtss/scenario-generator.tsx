"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateScenariosForLevel } from "@/actions/admin";

const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

export function ScenarioGenerator() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    generated: number;
    errors: string[];
  } | null>(null);

  function handleGenerate() {
    setResult(null);
    startTransition(async () => {
      const res = await generateScenariosForLevel(selectedLevel, 3);
      setResult(res);
    });
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lavender-muted">
          <Sparkles className="h-4 w-4 text-lavender" />
        </div>
        <div>
          <h3 className="font-semibold text-text">Generate Scenarios</h3>
          <p className="text-xs text-text-muted">
            Use AI to create new training scenarios for a curriculum level
          </p>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="level-select"
            className="text-sm font-medium text-text-muted"
          >
            Curriculum Level
          </label>
          <select
            id="level-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(Number(e.target.value))}
            className="h-11 rounded-lg bg-transparent px-4 text-sm text-text border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors duration-200 cursor-pointer"
          >
            {LEVELS.map((lvl) => (
              <option key={lvl} value={lvl} className="bg-surface text-text">
                Level {lvl}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleGenerate} loading={isPending} variant="primary">
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>
      </div>

      <AnimatePresence>
        {isPending && (
          <motion.p
            className="mt-4 text-sm text-text-muted"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Generating 3 scenarios for level {selectedLevel}...
          </motion.p>
        )}

        {result && (
          <motion.div
            className="mt-4 space-y-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {result.generated > 0 && (
              <div className="flex items-center gap-2 text-sm text-green">
                <CheckCircle className="h-4 w-4" />
                {result.generated} scenario{result.generated !== 1 ? "s" : ""}{" "}
                generated successfully
              </div>
            )}
            {result.errors.map((err, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-red"
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {err}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
