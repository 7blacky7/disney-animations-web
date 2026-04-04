"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAutoLoop, OVERSHOOT, CheckSvg } from "./_shared";
import type { DemoProps } from "./_shared";

const sequences = [
  [3, 1, 2, 0],
  [1, 3, 2, 0],
  [1, 2, 3, 0],
  [0, 1, 2, 3],
  [3, 1, 2, 0],
];
const items = ["Idee", "Storyboard", "Animation", "Polish"];

export function SortingDemo({ isPaused }: DemoProps) {
  const step = useAutoLoop(5, 1200, isPaused);
  const order = sequences[step] ?? [3, 1, 2, 0];
  const isDone = step === 3;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold mb-2">Bringe in die richtige Reihenfolge:</p>
      {order.map((idx, pos) => (
        <motion.div
          key={items[idx]}
          layout
          transition={OVERSHOOT}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
            isDone && idx === pos
              ? "border-success/40 bg-success/5"
              : "border-border/40 bg-background/60",
          )}
        >
          <span className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
            isDone && idx === pos ? "bg-success text-white" : "bg-muted text-muted-foreground",
          )}>
            {pos + 1}
          </span>
          <span className="font-medium">{items[idx]}</span>
          {isDone && idx === pos && <span className="ml-auto text-success"><CheckSvg className="h-2.5 w-2.5" /></span>}
        </motion.div>
      ))}
    </div>
  );
}
