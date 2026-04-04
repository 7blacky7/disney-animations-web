"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAutoLoop, OVERSHOOT, CheckSvg } from "./_shared";
import type { DemoProps } from "./_shared";

export function TimerDemo({ isPaused }: DemoProps) {
  const step = useAutoLoop(8, 750, isPaused);
  const timeLeft = Math.max(10 - step * 1.5, 0);
  const progress = timeLeft / 10;
  const isUrgent = timeLeft <= 4;
  const isCritical = timeLeft <= 2;
  const answered = step >= 6;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">Schnell antworten!</p>
        <motion.span
          animate={isCritical && !answered ? {
            scale: [1, 1.15, 1],
            rotate: [0, -2, 2, 0],
          } : isUrgent && !answered ? {
            scale: [1, 1.08, 1],
          } : {}}
          transition={{ duration: isCritical ? 0.3 : 0.5, repeat: Infinity }}
          className={cn(
            "font-mono text-sm font-bold tabular-nums",
            isCritical && !answered ? "text-destructive" :
            isUrgent && !answered ? "text-chart-3" :
            "text-muted-foreground",
          )}
        >
          {answered ? <CheckSvg className="h-3.5 w-3.5" /> : `${timeLeft.toFixed(1)}s`}
        </motion.span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          animate={{ scaleX: progress }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={cn(
            "h-full origin-left rounded-full transition-colors",
            isCritical ? "bg-destructive" : isUrgent ? "bg-chart-3" : "bg-primary",
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {["Timing", "Staging", "Appeal", "Arcs"].map((opt, i) => (
          <motion.div
            key={opt}
            animate={answered && i === 0 ? {
              scale: [1, 1.08, 1],
            } : {}}
            transition={OVERSHOOT}
            className={cn(
              "rounded-lg border px-2 py-1.5 text-center text-[10px] font-medium",
              answered && i === 0
                ? "border-success/40 bg-success/10 text-success-foreground"
                : "border-border/40",
            )}
          >
            {opt}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
