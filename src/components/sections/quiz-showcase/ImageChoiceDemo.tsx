"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAutoLoop, OVERSHOOT } from "./_shared";
import type { DemoProps } from "./_shared";

const imageLabels = ["Bounce", "Elastic", "Smooth", "Linear"];
const imageColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function ImageChoiceDemo({ isPaused }: DemoProps) {
  const step = useAutoLoop(6, 1000, isPaused);
  const selected = step >= 2 && step <= 4 ? 1 : -1;
  const confirmed = step >= 4;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold">Welche Kurve zeigt Spring-Easing?</p>
      <div className="grid grid-cols-2 gap-2">
        {imageLabels.map((label, i) => {
          const isActive = selected === i;
          const isCorrect = confirmed && i === 1;

          return (
            <motion.div
              key={label}
              animate={{
                scale: isActive ? 1.04 : 1,
                rotate: isCorrect ? [0, -2, 2, 0] : 0,
              }}
              transition={OVERSHOOT}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-2",
                !isActive && "border-border/40",
                isActive && !confirmed && "border-primary/40 ring-1 ring-primary/20",
                isCorrect && "border-success/50 ring-1 ring-success/20 bg-success/5",
              )}
            >
              <div className="h-10 w-full rounded-lg bg-muted/50 flex items-end justify-center pb-1">
                <svg viewBox="0 0 40 20" className="h-4 w-8">
                  <path
                    d={i === 0 ? "M0 18 Q10 -5 20 10 Q30 25 40 2" :
                       i === 1 ? "M0 18 Q15 -8 25 8 Q35 20 40 2" :
                       i === 2 ? "M0 18 Q20 2 40 2" :
                       "M0 18 L40 2"}
                    fill="none"
                    stroke={imageColors[i]}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
