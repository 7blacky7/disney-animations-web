"use server";

import { db } from "@/lib/db";
import { questions, quizResults, quizAnswers } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { EvaluateAnswerInput, AnswerEvaluationResult } from "./_types";
import { parseJsonField } from "./_helpers";

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
      const sortOrder = Array.isArray(correctRaw)
        ? (correctRaw as number[])
        : (correct?.correct as number[]) ?? [];
      const userOrder = input.answer as number[];
      isCorrect = Array.isArray(userOrder)
        && userOrder.length === sortOrder.length
        && userOrder.every((v, i) => v === sortOrder[i]);
      feedback.correctOrder = sortOrder;
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
