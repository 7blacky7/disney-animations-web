"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { QUIZ_SPRING } from "@/animations/variants/quiz";
import { useAutoLoop, OVERSHOOT } from "./_shared";
import type { DemoProps } from "./_shared";

const left = ["Bounce", "Elastic", "Power2"];
const right = ["Spring", "Snap", "Smooth"];

export function MatchingDemo({ isPaused }: DemoProps) {
  const step = useAutoLoop(6, 1000, isPaused);
  const matched = step >= 1 ? Math.min(step, 3) : 0;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold mb-2">Verbinde die Easing-Paare:</p>
      {left.map((l, i) => {
        const isConnected = i < matched;
        return (
          <div key={l} className="flex items-center gap-2">
            <motion.span
              animate={{ scale: isConnected ? 1.02 : 1 }}
              transition={{ ...QUIZ_SPRING.pop }}
              className={cn(
                "flex-1 rounded-lg border px-2 py-1.5 text-xs text-center",
                isConnected ? "border-primary/40 bg-primary/5 font-medium" : "border-border/40",
              )}
            >
              {l}
            </motion.span>
            <motion.div
              animate={{ scaleX: isConnected ? 1 : 0, opacity: isConnected ? 1 : 0.3 }}
              transition={OVERSHOOT}
              className="h-px w-6 origin-left bg-primary"
            />
            <motion.span
              animate={{ scale: isConnected ? 1.02 : 1 }}
              transition={{ ...QUIZ_SPRING.pop }}
              className={cn(
                "flex-1 rounded-lg border px-2 py-1.5 text-xs text-center",
                isConnected ? "border-primary/40 bg-primary/5 font-medium" : "border-border/40",
              )}
            >
              {right[i]}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
}
