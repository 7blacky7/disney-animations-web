"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAutoLoop, OVERSHOOT, CheckSvg } from "./_shared";
import type { DemoProps } from "./_shared";

const words = ["S", "Sp", "Spr", "Spri", "Sprin", "Spring"];

export function FillInDemo({ isPaused }: DemoProps) {
  const step = useAutoLoop(6, 1000, isPaused);
  const typed = step <= 5 ? words[step] : "Spring";
  const showCursor = step < 5;
  const showCheck = step >= 5;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold">Ergaenze das fehlende Wort:</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Eine <span className="font-medium text-foreground">___</span>-Animation
        erzeugt natuerliche Bewegung durch Federkraft.
      </p>
      <motion.div
        animate={showCheck ? { scale: [1, 1.05, 1] } : {}}
        transition={OVERSHOOT}
        className={cn(
          "flex items-center rounded-xl border px-3 py-2",
          showCheck ? "border-success/40 bg-success/5" : "border-primary/30 bg-primary/5",
        )}
      >
        <span className="font-mono text-sm font-medium">{typed}</span>
        {showCursor && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="ml-px inline-block h-4 w-px bg-primary"
          />
        )}
        {showCheck && <span className="ml-auto text-success"><CheckSvg className="h-3.5 w-3.5" /></span>}
      </motion.div>
    </div>
  );
}
