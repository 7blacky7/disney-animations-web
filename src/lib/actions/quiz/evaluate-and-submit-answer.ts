"use server";

import { db } from "@/lib/db";
import { questions, quizResults, quizAnswers } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { EvaluateAnswerInput, AnswerEvaluationResult } from "./_types";
import { parseJsonField } from "./_helpers";
import { dbg } from "@/lib/debug";

/**
 * SECURITY: Server-seitige Antwort-Auswertung.
 *
 * Evaluiert die Antwort server-seitig anhand der DB-Daten.
 * Client sendet NUR seine Antwort — KEIN isCorrect.
 * Server laedt die Frage, bewertet, speichert und gibt Feedback zurueck.
 *
 * @returns AnswerEvaluationResult mit isCorrect + Feedback-Daten fuer UI
 */
export async function evaluateAndSubmitAnswer(input: EvaluateAnswerInput): Promise<AnswerEvaluationResult> {
  const session = await requireSession();

  // Ownership-Check: Result muss dem User gehoeren
  const [resultOwner] = await db
    .select({ userId: quizResults.userId })
    .from(quizResults)
    .where(eq(quizResults.id, input.resultId))
    .limit(1);

  if (!resultOwner || resultOwner.userId !== session.user.id) {
    throw new Error("Kein Zugriff auf dieses Ergebnis");
  }

  // Frage aus DB laden
  const [q] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, input.questionId))
    .limit(1);

  if (!q) throw new Error("Frage nicht gefunden");

  // Correct Answer aus DB parsen
  const correctRaw = parseJsonField(q.correctAnswer);
  const correct = correctRaw as Record<string, unknown> | null;
  const opts = parseJsonField(q.options) as Record<string, unknown> | unknown[] | null;
  const optsArray = Array.isArray(opts) ? opts : null;
  const optsObj = optsArray === null ? (opts as Record<string, unknown> | null) : null;

  // Helper: correctIndex aus verschiedenen DB-Formaten extrahieren
  const resolveCorrectIndex = (): number => {
    if (correct?.correctIndex !== undefined) return correct.correctIndex as number;
    if (typeof correctRaw === "number") return correctRaw;
    if (typeof correctRaw === "string") {
      const n = parseInt(correctRaw, 10);
      if (!isNaN(n)) return n;
    }
    return 0;
  };

  let isCorrect = false;
  const feedback: Partial<AnswerEvaluationResult> = {};

  switch (q.type) {
    case "multiple_choice":
    case "image_choice": {
      const correctIdx = resolveCorrectIndex();
      isCorrect = input.answer === correctIdx;
      feedback.correctIndex = correctIdx;
      break;
    }
    case "true_false": {
      const tfAnswer = typeof correctRaw === "boolean"
        ? correctRaw
        : (correct?.correct as boolean) ?? false;
      isCorrect = input.answer === tfAnswer;
      feedback.correctAnswer = tfAnswer;
      break;
    }
    case "timed": {
      const timedOptions = (optsArray as string[]) ?? (optsObj?.options as string[]) ?? [];
      const correctIdx =
        correct?.correctIndex !== undefined
          ? (correct.correctIndex as number)
          : timedOptions.indexOf(correct?.correct as string) !== -1
            ? timedOptions.indexOf(correct?.correct as string)
            : resolveCorrectIndex();
      isCorrect = input.answer === correctIdx;
      feedback.correctIndex = correctIdx;
      break;
    }
    case "drag_drop":
    case "sorting": {
      // Normalize: DB hat 3 Formate (number[], string[], {correct: string[]})
      let sortOrder: unknown[];
      if (Array.isArray(correctRaw)) {
        sortOrder = correctRaw;
      } else if (correct?.correct && Array.isArray(correct.correct)) {
        sortOrder = correct.correct as unknown[];
      } else {
        sortOrder = [];
      }
      const userOrder = input.answer as unknown[];

      // Toleranter Vergleich: String/Number Mismatch ignorieren (== statt ===)
      // und Index-basiert (user sendet Indices) vs Value-basiert (DB hat Values)
      if (Array.isArray(userOrder) && userOrder.length === sortOrder.length) {
        // Fall 1: Beide sind Index-Arrays (Zahlen) → direkter Vergleich
        // Fall 2: sortOrder hat Values, userOrder hat Indices → Index-Vergleich
        const allNumeric = sortOrder.every((v) => typeof v === "number" || !isNaN(Number(v)));
        if (allNumeric) {
          // Numerischer Vergleich (tolerant für String/Number Mix)
          isCorrect = userOrder.every((v, i) => Number(v) === Number(sortOrder[i]));
        } else {
          // Value-basierter Vergleich (sortOrder hat echte Werte wie "Qualität")
          // User sendet Indices → korrekt wenn Indices = [0,1,2,...] (Original-Reihenfolge)
          isCorrect = userOrder.every((v, i) => Number(v) === i);
        }
      } else {
        isCorrect = false;
      }

      dbg.quiz("sorting/drag_drop Auswertung", {
        questionId: input.questionId,
        userOrder,
        sortOrder,
        correctRaw,
        isCorrect,
      });
      feedback.correctOrder = sortOrder.map(Number);
      break;
    }
    case "matching": {
      // Client sendet Pairs als { leftIdx: rightOriginalIdx }
      // Korrekt wenn leftIdx === rightOriginalIdx (gleicher Index = korrektes Paar)
      const userPairs = input.answer as Record<string, number>;
      if (userPairs && typeof userPairs === "object") {
        isCorrect = Object.entries(userPairs).every(
          ([l, r]) => Number(l) === r,
        );
      }
      break;
    }
    case "slider": {
      const sliderCorrect = (correct?.value as number) ?? 50;
      const tolerance = (correct?.tolerance as number) ?? 1;
      const userValue = input.answer as number;
      isCorrect = typeof userValue === "number"
        && Math.abs(userValue - sliderCorrect) <= tolerance;
      feedback.sliderCorrect = sliderCorrect;
      feedback.sliderTolerance = tolerance;
      break;
    }
    case "fill_blank": {
      const blankAnswer = typeof correctRaw === "string"
        ? correctRaw
        : (correct?.answer as string) ?? "";
      const blankAlts = typeof correctRaw === "string"
        ? []
        : ((correct?.alternatives as string[]) ?? []);
      const allAnswers = [blankAnswer, ...blankAlts].filter(Boolean);
      const userText = typeof input.answer === "string"
        ? input.answer.trim().toLowerCase()
        : "";
      isCorrect = allAnswers.some(
        (a) => a.toLowerCase().trim() === userText,
      );
      dbg.quiz("fill_blank Auswertung", {
        questionId: input.questionId,
        userText,
        allAnswers,
        correctRaw,
        correctObj: correct,
        isCorrect,
      });
      feedback.blankAnswers = allAnswers;
      break;
    }
    case "free_text": {
      const kw = (correct?.keywords as string[])
        ?? (optsObj?.keywords as string[])
        ?? [];
      const userText = typeof input.answer === "string"
        ? input.answer.trim().toLowerCase()
        : "";
      isCorrect = kw.length === 0
        ? userText.length > 0
        : kw.some((k) => userText.includes(k.toLowerCase()));
      feedback.keywords = kw;
      break;
    }
    case "code_input": {
      // Zeichen-fuer-Zeichen Vergleich gegen Musterloesung
      const solution = q.codeSolution ?? "";
      const userCode = typeof input.answer === "string" ? input.answer : "";

      // Normalisierung: Trailing whitespace entfernen, line endings vereinheitlichen
      const normSolution = solution.replace(/\r\n/g, "\n").trimEnd();
      const normUser = userCode.replace(/\r\n/g, "\n").trimEnd();

      isCorrect = normSolution === normUser;
      feedback.codeSolution = solution;
      break;
    }
    case "terminal": {
      // Terminal: String-Match gegen erwartete Befehle (exakt oder mehrere Varianten)
      const termCorrect = correctRaw as Record<string, unknown> | null;
      const expectedCmds = (termCorrect?.commands as string[])
        ?? (Array.isArray(correctRaw) ? (correctRaw as string[]) : []);
      const termOutput = (termCorrect?.output as string) ?? "";
      const userCmd = typeof input.answer === "string" ? input.answer.trim() : "";

      // Vergleich: Case-insensitive, trimmed
      isCorrect = expectedCmds.some(
        (cmd) => cmd.trim().toLowerCase() === userCmd.toLowerCase(),
      );
      feedback.expectedCommands = expectedCmds;
      feedback.expectedOutput = termOutput;
      break;
    }
  }

  // Punkte berechnen (Base + Speed Bonus)
  const POINTS_PER_CORRECT = 100;
  const SPEED_BONUS_THRESHOLD = 10;
  let points = 0;

  if (isCorrect) {
    points = POINTS_PER_CORRECT;
    const timeTaken = input.timeTaken ?? (q.timeLimit ?? 30);
    if (timeTaken <= SPEED_BONUS_THRESHOLD) {
      points += Math.round(
        (1 - timeTaken / SPEED_BONUS_THRESHOLD) * POINTS_PER_CORRECT * 0.5,
      );
    }

    // Streak-Bonus: Server berechnet aus bisherigen Antworten
    const prevAnswers = await db
      .select({ isCorrect: quizAnswers.isCorrect })
      .from(quizAnswers)
      .where(eq(quizAnswers.resultId, input.resultId))
      .orderBy(quizAnswers.createdAt);

    let streak = 0;
    for (let i = prevAnswers.length - 1; i >= 0; i--) {
      if (prevAnswers[i].isCorrect) streak++;
      else break;
    }
    streak++; // Aktuelle korrekte Antwort dazuzaehlen

    const STREAK_BONUS = 50;
    if (streak >= 3) {
      points += STREAK_BONUS * Math.min(streak, 10);
    }
  }

  // Antwort in DB speichern
  await db.insert(quizAnswers).values({
    resultId: input.resultId,
    questionId: input.questionId,
    answer: input.answer != null ? JSON.stringify(input.answer) : null,
    isCorrect,
    timeTaken: input.timeTaken,
    pointsEarned: points,
  });

  // Score im Result aktualisieren
  if (isCorrect) {
    const [result] = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.id, input.resultId))
      .limit(1);

    if (result) {
      await db
        .update(quizResults)
        .set({ score: result.score + points })
        .where(eq(quizResults.id, input.resultId));
    }
  }

  return {
    isCorrect,
    points,
    ...feedback,
  };
}
