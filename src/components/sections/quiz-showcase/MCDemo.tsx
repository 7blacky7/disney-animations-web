"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { QUIZ_SPRING } from "@/animations/variants/quiz";
import { useAutoLoop, OVERSHOOT, CheckSvg, CrossSvg } from "./_shared";
import type { DemoProps } from "./_shared";

const mcOpts = ["Squash & Stretch", "Staging", "Anticipation", "Follow Through"];

export function MCDemo({ isPaused }: DemoProps) {
  const step = useAutoLoop(8, 750, isPaused);
  const selected = step >= 1 && step <= 3 ? step - 1 : step >= 4 && step <= 6 ? 2 : -1;
  const confirmed = step >= 5 && step <= 7;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold mb-2">Welches Prinzip kommt vor der Aktion?</p>
      {mcOpts.map((opt, i) => {
        const isSelected = selected === i;
        const isCorrect = confirmed && i === 2;
        const isWrong = confirmed && isSelected && i !== 2;

        return (
          <motion.div
            key={opt}
            animate={{
              scale: isSelected && !confirmed ? 1.03 : 1,
              x: isWrong ? [0, -4, 4, -2, 0] : 0,
            }}
            transition={isWrong ? { duration: 0.3 } : { ...QUIZ_SPRING.pop }}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
              !isSelected && "border-border/40",
              isSelected && !confirmed && "border-primary/40 bg-primary/5",
              isCorrect && "border-success/50 bg-success/10",
              isWrong && "border-destructive/40 bg-destructive/5",
            )}
          >
            <span className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
              isCorrect ? "bg-success text-white" :
              isWrong ? "bg-destructive text-white" :
              isSelected ? "bg-primary text-primary-foreground" :
              "border border-muted-foreground/30 text-muted-foreground",
            )}>
              {isCorrect ? <CheckSvg className="h-2 w-2" /> : isWrong ? <CrossSvg className="h-2 w-2" /> : String.fromCharCode(65 + i)}
            </span>
            <span className={cn(isSelected && "font-medium")}>{opt}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
