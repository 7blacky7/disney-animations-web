"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAutoLoop, OVERSHOOT, CheckSvg, CrossSvg } from "./_shared";
import type { DemoProps } from "./_shared";

export function TrueFalseDemo({ isPaused }: DemoProps) {
  const step = useAutoLoop(6, 1000, isPaused);
  const selection = step >= 2 && step <= 3 ? "true" : step >= 4 ? "false" : null;
  const revealed = step >= 3;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold">Wahr oder Falsch?</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        &quot;Follow Through bedeutet, dass Objekte abrupt stoppen.&quot;
      </p>
      <div className="flex gap-2">
        {(["true", "false"] as const).map((opt) => {
          const isSelected = selection === opt;
          const isCorrectReveal = revealed && opt === "false";
          const isWrongReveal = revealed && isSelected && opt === "true";

          return (
            <motion.button
              key={opt}
              animate={{
                scale: isSelected && !revealed ? [1, 1.08, 1] : 1,
                rotate: isWrongReveal ? [0, -3, 3, 0] : 0,
              }}
              transition={OVERSHOOT}
              className={cn(
                "flex-1 rounded-xl border py-3 text-xs font-bold uppercase tracking-wider",
                !isSelected && "border-border/40 text-muted-foreground",
                isSelected && !revealed && "border-primary/40 bg-primary/10 text-primary",
                isCorrectReveal && "border-success/50 bg-success/10 text-success-foreground",
                isWrongReveal && "border-destructive/40 bg-destructive/5 text-destructive",
              )}
            >
              {opt === "true" ? "Wahr" : "Falsch"}
              {isCorrectReveal && <> <CheckSvg className="inline h-2.5 w-2.5" /></>}
              {isWrongReveal && <> <CrossSvg className="inline h-2.5 w-2.5" /></>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
