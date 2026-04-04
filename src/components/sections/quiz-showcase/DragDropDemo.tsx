"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAutoLoop, OVERSHOOT, GripIcon } from "./_shared";
import type { DemoProps } from "./_shared";

const items = ["Timing", "Spacing", "Appeal"];

export function DragDropDemo({ isPaused }: DemoProps) {
  const step = useAutoLoop(4, 1500, isPaused);
  const order = useMemo(() => {
    const sequences = [[1, 0, 2], [1, 2, 0], [2, 1, 0], [0, 1, 2]];
    return sequences[step] ?? [0, 1, 2];
  }, [step]);

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold mb-2">Sortiere nach Wichtigkeit:</p>
      {order.map((idx, pos) => (
        <motion.div
          key={items[idx]}
          layout
          transition={OVERSHOOT}
          className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/60 px-3 py-2 text-xs"
        >
          <span className="text-muted-foreground/50 font-mono text-[10px]">{pos + 1}</span>
          <GripIcon />
          <span className="font-medium">{items[idx]}</span>
        </motion.div>
      ))}
    </div>
  );
}
