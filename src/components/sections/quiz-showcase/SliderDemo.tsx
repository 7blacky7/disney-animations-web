"use client";

import { motion } from "framer-motion";
import { useAutoLoop, OVERSHOOT } from "./_shared";
import type { DemoWithHueProps } from "./_shared";

const values = [25, 55, 80, 45, 25];

export function SliderDemo({ isPaused, hue }: DemoWithHueProps) {
  const step = useAutoLoop(5, 1200, isPaused);
  const val = values[step] ?? 25;

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold">Wie sicher bist du?</p>
      <motion.p
        key={val}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={OVERSHOOT}
        className="text-center font-heading text-3xl font-bold"
        style={{ color: hue }}
      >
        {val}%
      </motion.p>
      <div className="relative h-2 rounded-full bg-muted">
        <motion.div
          animate={{ scaleX: val / 100 }}
          transition={OVERSHOOT}
          className="h-full origin-left rounded-full"
          style={{ backgroundColor: hue }}
        />
        <motion.div
          animate={{
            x: `${val}%`,
            scaleX: [1, 0.8, 1],
            scaleY: [1, 1.2, 1],
          }}
          transition={OVERSHOOT}
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow-md"
          style={{ backgroundColor: hue }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Unsicher</span>
        <span>Sehr sicher</span>
      </div>
    </div>
  );
}
