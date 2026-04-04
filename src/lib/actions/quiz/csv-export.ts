"use server";

import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { quizzes, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { dbg } from "@/lib/debug";

/**
 * CSV Export — Quiz als CSV herunterladen
 *
 * Format: type,text,options,correctAnswer,points,timeLimit,...extraFields
 * Erste Zeile: Quiz-Metadaten (Titel, Beschreibung, Modus)
 * Ab Zeile 2: Fragen mit allen Antwort-Daten
 *
 * SECURITY: Nur department_lead+ darf exportieren (enthält korrekte Antworten!)
 */

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

interface QuizCSVResult {
  csv: string;
  filename: string;
}

export async function exportQuizAsCSV(quizId: string): Promise<QuizCSVResult> {
  await requireRole("department_lead");

  dbg.quiz("CSV Export", { quizId });

  // Fetch quiz + questions
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
  });

  if (!quiz) throw new Error("Quiz nicht gefunden");

  const quizQuestions = await db.query.questions.findMany({
    where: eq(questions.quizId, quizId),
    orderBy: (q, { asc }) => [asc(q.sortOrder)],
  });

  // Build CSV
  const rows: string[] = [];

  // Header row
  rows.push([
    "type",
    "text",
    "options",
    "correctAnswer",
    "points",
    "timeLimit",
    "items",
    "matchLeft",
    "matchRight",
    "sliderMin",
    "sliderMax",
    "sliderCorrect",
    "sliderTolerance",
    "blankText",
    "blankAnswers",
    "keywords",
    "codeTemplate",
    "codeSolution",
    "programmingLanguage",
    "referenceUrls",
    "terminalPrompt",
    "terminalHint",
    "imageUrls",
  ].join(","));

  // Quiz metadata as comment
  rows.push(`# Quiz: ${escapeCSV(quiz.title)}`);
  rows.push(`# Beschreibung: ${escapeCSV(quiz.description)}`);
  rows.push(`# Modus: ${quiz.mode}`);

  // Question rows
  for (const q of quizQuestions) {
    const correctAnswer = q.correctAnswer as Record<string, unknown> | null;

    rows.push([
      escapeCSV(q.type),
      escapeCSV(q.text),
      escapeCSV(q.options ? JSON.stringify(q.options) : null),
      escapeCSV(correctAnswer ? JSON.stringify(correctAnswer) : null),
      String(q.points ?? 100),
      String(q.timeLimit ?? 30),
      escapeCSV(q.items ? JSON.stringify(q.items) : null),
      escapeCSV(q.matchLeft ? JSON.stringify(q.matchLeft) : null),
      escapeCSV(q.matchRight ? JSON.stringify(q.matchRight) : null),
      String(q.sliderMin ?? ""),
      String(q.sliderMax ?? ""),
      String(q.sliderCorrect ?? ""),
      String(q.sliderTolerance ?? ""),
      escapeCSV(q.blankText),
      escapeCSV(q.blankAnswers ? JSON.stringify(q.blankAnswers) : null),
      escapeCSV(q.keywords ? JSON.stringify(q.keywords) : null),
      escapeCSV(q.codeTemplate),
      escapeCSV(q.codeSolution),
      escapeCSV(q.programmingLanguage),
      escapeCSV(q.referenceUrls ? JSON.stringify(q.referenceUrls) : null),
      escapeCSV(q.terminalPrompt),
      escapeCSV(q.terminalHint),
      escapeCSV(q.imageUrls ? JSON.stringify(q.imageUrls) : null),
    ].join(","));
  }

  const csv = rows.join("\n");
  const filename = `${quiz.title.replace(/[^a-zA-Z0-9äöüÄÖÜß-]/g, "_")}_export.csv`;

  dbg.quiz("CSV Export fertig", { quizId, questions: quizQuestions.length, bytes: csv.length });

  return { csv, filename };
}
