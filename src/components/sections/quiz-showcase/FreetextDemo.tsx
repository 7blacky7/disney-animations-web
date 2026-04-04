"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { QUIZ_SPRING } from "@/animations/variants/quiz";
import { useAutoLoop, SparkleSvg } from "./_shared";
import type { DemoProps } from "./_shared";

const fullText = "Anticipation bereitet den Zuschauer auf eine bevorstehende Aktion vor.";

export function FreetextDemo({ isPaused }: DemoProps) {
  const step = useAutoLoop(8, 750, isPaused);
  const charCount = Math.min(step * 10, fullText.length);
  const text = fullText.slice(0, charCount);
  const isDone = charCount >= fullText.length;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold">Erklaere das Prinzip in eigenen Worten:</p>
      <div className={cn(
        "min-h-[60px] rounded-xl border px-3 py-2 text-xs leading-relaxed",
        isDone ? "border-primary/30 bg-primary/5" : "border-border/40",
      )}>
        <span>{text}</span>
        {!isDone && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="inline-block h-3 w-px bg-foreground ml-px"
          />
        )}
      </div>
      {isDone && (
        <motion.div
          initial={{ y: 4 }}
          animate={{ y: 0 }}
          transition={{ ...QUIZ_SPRING.pop }}
          className="flex items-center gap-1.5 text-[10px] text-primary font-medium"
        >
          <SparkleSvg className="h-3 w-3 inline-block" />
          {" "}Gespeichert
        </motion.div>
      )}
    </div>
  );
}
