"use client";

import { useState, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { dbg } from "@/lib/debug";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * CodeInputQuestion — Monaco Code-Editor mit Zeichen-für-Zeichen Validierung
 *
 * Zeigt ein Code-Gerüst (codeTemplate) im Monaco Editor.
 * Nach Abgabe: Zeichen-für-Zeichen Vergleich mit der Musterlösung.
 *
 * Farbcodierung (nach Abgabe):
 * - 🟢 Grün: Zeichen stimmt mit Musterlösung überein
 * - ⚪ Weiß: Position nicht ausgefüllt (Platzhalter)
 * - 🔴 Rot: Zeichen ist falsch
 *
 * SECURITY: codeSolution kommt erst NACH Abgabe vom Server (AnswerFeedback).
 * Der Client kennt die Lösung NICHT vorher.
 */

// Language mapping for Monaco Editor
const LANGUAGE_MAP: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  html: "html",
  css: "css",
  sql: "sql",
  json: "json",
  java: "java",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  php: "php",
};

type CharStatus = "correct" | "wrong" | "missing";

interface CharValidation {
  char: string;
  expected: string;
  status: CharStatus;
}

function validateCharByChar(userCode: string, solution: string): CharValidation[] {
  const maxLen = Math.max(userCode.length, solution.length);
  const result: CharValidation[] = [];

  for (let i = 0; i < maxLen; i++) {
    const userChar = userCode[i] ?? "";
    const expectedChar = solution[i] ?? "";

    if (i >= userCode.length) {
      result.push({ char: expectedChar, expected: expectedChar, status: "missing" });
    } else if (userChar === expectedChar) {
      result.push({ char: userChar, expected: expectedChar, status: "correct" });
    } else {
      result.push({ char: userChar, expected: expectedChar, status: "wrong" });
    }
  }

  return result;
}

export function CodeInputQuestion({
  question,
  onAnswer,
  showFeedback,
  disabled,
  feedback,
}: QuestionProps) {
  const [code, setCode] = useState(question.codeTemplate ?? "");
  const [submitted, setSubmitted] = useState(false);

  const language = LANGUAGE_MAP[question.programmingLanguage ?? "javascript"] ?? "javascript";

  const handleSubmit = useCallback(() => {
    if (disabled || submitted) return;
    dbg.quiz("Code-Antwort abgegeben", {
      questionId: question.id,
      language,
      codeLength: code.length,
    });
    setSubmitted(true);
    onAnswer(code);
  }, [code, disabled, submitted, onAnswer, question.id, language]);

  // Zeichen-für-Zeichen Validierung (nur nach Server-Feedback)
  const validation = useMemo(() => {
    if (!showFeedback || !feedback?.codeSolution) return null;
    return validateCharByChar(code, feedback.codeSolution);
  }, [showFeedback, feedback?.codeSolution, code]);

  // Statistiken für Feedback-Anzeige
  const stats = useMemo(() => {
    if (!validation) return null;
    const correct = validation.filter((v) => v.status === "correct").length;
    const wrong = validation.filter((v) => v.status === "wrong").length;
    const missing = validation.filter((v) => v.status === "missing").length;
    const total = validation.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, wrong, missing, total, percentage };
  }, [validation]);

  return (
    <div className="space-y-4">
      {/* Reference URLs / Lernmaterial */}
      {question.referenceUrls && question.referenceUrls.length > 0 && (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            📚 Lernmaterial
          </p>
          <ul className="space-y-1">
            {question.referenceUrls.map((ref, i) => (
              <li key={i}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {ref.title || ref.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Monaco Editor */}
      <div className={cn(
        "overflow-hidden rounded-lg border",
        showFeedback && feedback?.isCorrect && "border-green-500/50",
        showFeedback && feedback && !feedback.isCorrect && "border-red-500/50",
        !showFeedback && "border-border/50",
      )}>
        <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {question.programmingLanguage ?? "JavaScript"}
          </span>
          {stats && (
            <span className={cn(
              "text-xs font-bold",
              stats.percentage >= 80 ? "text-green-500" : stats.percentage >= 50 ? "text-amber-500" : "text-red-500",
            )}>
              {stats.percentage}% korrekt
            </span>
          )}
        </div>
        <Editor
          height="250px"
          language={language}
          value={code}
          onChange={(value) => !disabled && setCode(value ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            readOnly: disabled,
            domReadOnly: disabled,
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>

      {/* Submit Button */}
      {!showFeedback && (
        <motion.button
          onClick={handleSubmit}
          disabled={disabled || submitted || code.trim() === (question.codeTemplate ?? "").trim()}
          whileHover={disabled ? undefined : { scale: 1.02 }}
          whileTap={disabled ? undefined : { scale: 0.98 }}
          className={cn(
            "w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {submitted ? "Wird ausgewertet..." : "Code abgeben"}
        </motion.button>
      )}

      {/* Feedback: Zeichen-für-Zeichen Validierung */}
      {showFeedback && validation && (
        <div className="space-y-3">
          {/* Stats Bar */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
              {stats?.correct} korrekt
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              {stats?.wrong} falsch
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              {stats?.missing} fehlend
            </span>
          </div>

          {/* Character-by-character diff view */}
          <div className="overflow-x-auto rounded-lg bg-zinc-950 p-3 font-mono text-sm leading-relaxed">
            <pre className="whitespace-pre-wrap break-all">
              {validation.map((v, i) => (
                <span
                  key={i}
                  className={cn(
                    v.status === "correct" && "text-green-400",
                    v.status === "wrong" && "bg-red-500/20 text-red-400",
                    v.status === "missing" && "bg-zinc-800 text-zinc-600",
                  )}
                  title={
                    v.status === "wrong"
                      ? `Erwartet: "${v.expected}"`
                      : v.status === "missing"
                        ? `Fehlend: "${v.expected}"`
                        : undefined
                  }
                >
                  {v.status === "missing" ? v.expected : v.char}
                </span>
              ))}
            </pre>
          </div>

          {/* Musterlösung (nach Abgabe sichtbar) */}
          {feedback?.codeSolution && (
            <details className="rounded-lg border border-border/30 bg-muted/20">
              <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                Musterlösung anzeigen
              </summary>
              <div className="border-t border-border/30 p-3">
                <pre className="overflow-x-auto font-mono text-sm text-foreground/80">
                  {feedback.codeSolution}
                </pre>
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
