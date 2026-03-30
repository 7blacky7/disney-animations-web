"use client";

import { type ComponentProps, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { SPRING, TIMING } from "@/lib/animation-utils";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * AnimatedInput — Focus: floating label + border glow
 *
 * Disney Principles:
 * - Anticipation: label lifts before field activates
 * - Follow-through: spring overshoot on label float
 * - Staging: focus glow directs attention
 * - Appeal: refined, professional micro-interaction
 *
 * Accessibility: label always visible, proper for/id association
 */

interface AnimatedInputProps extends Omit<ComponentProps<typeof Input>, "id"> {
  /** Floating label text */
  label: string;
  /** Error message */
  error?: string;
  /** Help text shown below input */
  helperText?: string;
  /** Container className */
  containerClassName?: string;
}

export function AnimatedInput({
  label,
  error,
  helperText,
  containerClassName,
  className,
  value,
  defaultValue,
  onFocus,
  onBlur,
  ...inputProps
}: AnimatedInputProps) {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    Boolean(value || defaultValue),
  );
  const { prefersReducedMotion } = useAccessibility();

  const isFloating = isFocused || hasValue;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(Boolean(e.target.value));
    onBlur?.(e);
  };

  return (
    <div className={cn("relative", containerClassName)}>
      {/* Floating label */}
      <motion.label
        htmlFor={id}
        animate={
          prefersReducedMotion
            ? { opacity: 1 }
            : {
                y: isFloating ? -26 : 0,
                scale: isFloating ? 0.85 : 1,
                color: isFocused
                  ? "var(--primary)"
                  : error
                    ? "var(--destructive)"
                    : "var(--muted-foreground)",
              }
        }
        transition={prefersReducedMotion ? { duration: 0.01 } : { ...SPRING.snappy }}
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 origin-left",
          "pointer-events-none select-none",
          "text-sm text-muted-foreground",
          "transition-colors duration-200",
          // When floating, add background to cover border
          isFloating && "px-1 bg-background",
        )}
      >
        {label}
      </motion.label>

      {/* Input with focus glow */}
      <Input
        id={id}
        value={value}
        defaultValue={defaultValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={cn(
          "h-11 pt-1",
          "transition-shadow duration-300",
          isFocused && !error && "shadow-[0_0_0_3px] shadow-primary/10",
          isFocused && error && "shadow-[0_0_0_3px] shadow-destructive/10",
          className,
        )}
        {...inputProps}
      />

      {/* Error / Helper text with enter/exit animation */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="error"
            id={`${id}-error`}
            role="alert"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: TIMING.quick, ease: "easeOut" }}
            className="mt-1.5 text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
        {!error && helperText && (
          <motion.p
            key="helper"
            id={`${id}-helper`}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: TIMING.quick }}
            className="mt-1.5 text-xs text-muted-foreground"
          >
            {helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
