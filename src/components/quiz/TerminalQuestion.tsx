"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { dbg } from "@/lib/debug";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * TerminalQuestion — Simuliertes Terminal für Befehls-Eingabe
 *
 * Zeigt ein Terminal-UI (dark theme, Monospace) wo der User
 * Befehle eingibt. KEINE Ausführung — reiner String-Match.
 *
 * Nach Abgabe: Feedback ob Befehl korrekt (grün/rot), erwartete
 * Befehle + simulierte Ausgabe anzeigen.
 *
 * Schema:
 * - Client: terminalPrompt, terminalHint
 * - Feedback: expectedCommands[], expectedOutput
 * - Evaluation: Case-insensitive, Whitespace-tolerant
 */

interface TerminalLine {
  type: "prompt" | "input" | "output" | "error" | "success";
  content: string;
}

export function TerminalQuestion({
  question,
  onAnswer,
  showFeedback,
  disabled,
  feedback,
}: QuestionProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const terminalPrompt = (question as unknown as Record<string, string>).terminalPrompt ?? "~$";
  const terminalHint = (question as unknown as Record<string, string>).terminalHint;

  // Auto-scroll terminal
  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight });
  }, [history]);

  // Focus input on click anywhere in terminal
  const focusInput = useCallback(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = useCallback(() => {
    if (disabled || submitted || !input.trim()) return;

    const command = input.trim();
    dbg.quiz("Terminal-Befehl", { questionId: question.id, command });

    // Add command to history
    setHistory((prev) => [
      ...prev,
      { type: "input", content: `${terminalPrompt} ${command}` },
    ]);

    setInput("");
    setSubmitted(true);
    onAnswer(command);
  }, [input, disabled, submitted, onAnswer, question.id, terminalPrompt]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // Show feedback in terminal
  useEffect(() => {
    if (!showFeedback || !feedback) return;

    const lines: TerminalLine[] = [];

    if (feedback.isCorrect) {
      lines.push({ type: "success", content: "✓ Korrekt!" });
      // Show simulated output if available
      const expectedOutput = (feedback as unknown as Record<string, string>).expectedOutput;
      if (expectedOutput) {
        lines.push({ type: "output", content: expectedOutput });
      }
    } else {
      lines.push({ type: "error", content: "✗ Nicht ganz richtig." });
      // Show expected commands
      const expectedCommands = (feedback as unknown as Record<string, string[]>).expectedCommands;
      if (expectedCommands?.length) {
        lines.push({
          type: "output",
          content: `Erwartet: ${expectedCommands.join(" oder ")}`,
        });
      }
      const expectedOutput = (feedback as unknown as Record<string, string>).expectedOutput;
      if (expectedOutput) {
        lines.push({ type: "output", content: `Ausgabe: ${expectedOutput}` });
      }
    }

    setHistory((prev) => [...prev, ...lines]);
  }, [showFeedback, feedback]);

  return (
    <div className="space-y-3">
      {/* Terminal Hint */}
      {terminalHint && !showFeedback && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            💡 Hinweis: {terminalHint}
          </p>
        </div>
      )}

      {/* Terminal Window */}
      <div
        className={cn(
          "overflow-hidden rounded-lg border",
          showFeedback && feedback?.isCorrect && "border-green-500/50",
          showFeedback && feedback && !feedback.isCorrect && "border-red-500/50",
          !showFeedback && "border-zinc-700",
        )}
      >
        {/* Title Bar */}
        <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-[10px] font-medium text-zinc-400">Terminal</span>
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalRef}
          onClick={focusInput}
          className="h-[200px] cursor-text overflow-y-auto bg-zinc-950 p-3 font-mono text-sm"
        >
          {/* Welcome message */}
          <div className="text-zinc-500 text-xs mb-2">
            Gib den richtigen Befehl ein und drücke Enter.
          </div>

          {/* History */}
          {history.map((line, i) => (
            <div
              key={i}
              className={cn(
                "leading-relaxed",
                line.type === "input" && "text-zinc-100",
                line.type === "output" && "text-zinc-400",
                line.type === "success" && "text-green-400 font-semibold",
                line.type === "error" && "text-red-400 font-semibold",
              )}
            >
              {line.content}
            </div>
          ))}

          {/* Active Input Line */}
          {!submitted && !disabled && (
            <div className="flex items-center text-zinc-100">
              <span className="text-green-400 mr-2 shrink-0">{terminalPrompt}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="flex-1 bg-transparent outline-none caret-green-400 text-zinc-100"
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal-Eingabe"
              />
              {/* Blinking cursor */}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-green-400"
              >
                ▌
              </motion.span>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button (if not auto-submitted via Enter) */}
      {!showFeedback && !submitted && (
        <motion.button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          whileHover={disabled ? undefined : { scale: 1.02 }}
          whileTap={disabled ? undefined : { scale: 0.98 }}
          className={cn(
            "w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          Befehl ausführen
        </motion.button>
      )}

      {/* Feedback: Expected commands */}
      {showFeedback && feedback && (
        <div className="rounded-lg border border-border/30 bg-muted/20 p-3 text-xs text-muted-foreground">
          <p className="font-medium mb-1">
            {feedback.isCorrect ? "Richtig! 🎉" : "Erwartete Lösung:"}
          </p>
          {!feedback.isCorrect && (
            <code className="text-foreground/80">
              {((feedback as unknown as Record<string, string[]>).expectedCommands ?? []).join(
                " oder ",
              )}
            </code>
          )}
        </div>
      )}
    </div>
  );
}
