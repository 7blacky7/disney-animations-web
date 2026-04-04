"use server";

import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { dbg } from "@/lib/debug";
import type { CreateQuestionInput } from "./_types";

/**
 * Frage zu einem Quiz hinzufuegen.
 *
 * Normalisiert correctAnswer in das kanonische Format pro Fragetyp:
 * - multiple_choice/image_choice/timed: number (Index)
 * - true_false: boolean
 * - fill_blank: { answer: string, alternatives: string[] }
 * - sorting/drag_drop: number[] (Index-Reihenfolge)
 * - slider: { value: number, tolerance: number }
 * - free_text: { keywords: string[] }
 * - terminal: { commands: string[], output: string }
 * - code_input: (uses codeSolution field, not correctAnswer)
 */

function normalizeCorrectAnswer(type: string, raw: unknown): unknown {
  if (raw === null || raw === undefined) return null;

  switch (type) {
    case "multiple_choice":
    case "image_choice":
    case "timed":
      // Kanonisch: number (Index)
      return typeof raw === "number" ? raw : Number(raw) || 0;

    case "true_false":
      // Kanonisch: boolean
      if (typeof raw === "boolean") return raw;
      if (typeof raw === "string") return raw.toLowerCase() === "true";
      return Boolean(raw);

    case "fill_blank":
      // Kanonisch: { answer: string, alternatives: string[] }
      if (typeof raw === "string") {
        return { answer: raw, alternatives: [] };
      }
      if (typeof raw === "object" && raw !== null) {
        const obj = raw as Record<string, unknown>;
        return {
          answer: (obj.answer as string) ?? "",
          alternatives: Array.isArray(obj.alternatives)
            ? (obj.alternatives as string[])
            : [],
        };
      }
      return { answer: String(raw), alternatives: [] };

    case "sorting":
    case "drag_drop":
      // Kanonisch: number[] (Indices)
      if (Array.isArray(raw)) {
        return raw.map((v) => (typeof v === "number" ? v : Number(v) || 0));
      }
      if (typeof raw === "object" && raw !== null) {
        const obj = raw as Record<string, unknown>;
        if (Array.isArray(obj.correct)) {
          return obj.correct.map((_: unknown, i: number) => i);
        }
      }
      return [];

    case "slider":
      // Kanonisch: { value: number, tolerance: number }
      if (typeof raw === "object" && raw !== null) {
        const obj = raw as Record<string, unknown>;
        return {
          value: Number(obj.value ?? obj.correct ?? 50),
          tolerance: Number(obj.tolerance ?? 5),
        };
      }
      return { value: Number(raw) || 50, tolerance: 5 };

    case "free_text":
      // Kanonisch: { keywords: string[] }
      if (typeof raw === "object" && raw !== null) {
        const obj = raw as Record<string, unknown>;
        return {
          keywords: Array.isArray(obj.keywords) ? (obj.keywords as string[]) : [],
        };
      }
      return { keywords: [] };

    case "terminal":
      // Kanonisch: { commands: string[], output: string }
      if (typeof raw === "object" && raw !== null) {
        const obj = raw as Record<string, unknown>;
        return {
          commands: Array.isArray(obj.commands) ? (obj.commands as string[]) : [],
          output: (obj.output as string) ?? "",
        };
      }
      return { commands: [], output: "" };

    case "code_input":
      // codeSolution is a separate field, not in correctAnswer
      return null;

    default:
      return raw;
  }
}

export async function addQuestion(input: CreateQuestionInput) {
  await requireRole("department_lead");

  const normalized = normalizeCorrectAnswer(input.type, input.correctAnswer);

  dbg.quiz("addQuestion", {
    type: input.type,
    rawCorrectAnswer: input.correctAnswer,
    normalizedCorrectAnswer: normalized,
  });

  const [question] = await db.insert(questions).values({
    quizId: input.quizId,
    type: input.type as "multiple_choice",
    content: input.content,
    options: input.options ? JSON.stringify(input.options) : null,
    correctAnswer: normalized !== null ? JSON.stringify(normalized) : null,
    explanation: input.explanation,
    order: input.order,
    timeLimit: input.timeLimit,
    points: input.points ?? 10,
  }).returning();

  return question;
}
