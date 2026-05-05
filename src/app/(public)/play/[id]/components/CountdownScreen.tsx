"use client";

import { motion, AnimatePresence } from "framer-motion";
import { countdownNumber, countdownRing, countdownPulse } from "@/animations";
import { COUNTDOWN_SECONDS, TIMER_CIRCUMFERENCE } from "./quiz-constants";

/**
 * Quiz Countdown Screen (3-2-1).
 * Animation Principle: Anticipation (builds tension), Timing (rhythmic countdown)
 */
export function CountdownScreen({ countdownValue }: { countdownValue: number }) {
  return (
    <motion.div
      key="countdown"
      className="flex flex-col items-center justify-center space-y-8"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background Pulse */}
      <motion.div
        variants={countdownPulse}
        initial="rest"
        animate={countdownValue <= 1 ? "urgent" : "pulse"}
        className="absolute inset-0 rounded-3xl bg-primary/5"
        aria-hidden="true"
      />

      {/* Timer Ring */}
      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
            className="text-primary"
            variants={countdownRing}
            initial="full"
            animate="empty"
            style={{ strokeDasharray: TIMER_CIRCUMFERENCE }}
          />
        </svg>

        <AnimatePresence mode="wait">
          {COUNTDOWN_SECONDS.includes(countdownValue) && (
            <motion.span
              key={`cd-${countdownValue}`}
              variants={countdownNumber}
              initial="enter"
              animate="visible"
              exit="exit"
              className="relative font-heading text-6xl font-bold text-primary"
            >
              {countdownValue}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <p className="relative text-sm text-muted-foreground">Mach dich bereit...</p>
    </motion.div>
  );
}
