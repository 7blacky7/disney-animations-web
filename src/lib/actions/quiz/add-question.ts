"use server";

import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import type { CreateQuestionInput } from "./_types";

/**
 * Frage zu einem Quiz hinzufuegen.
 */
export async function addQuestion(input: CreateQuestionInput) {
  await requireRole("department_lead");

  const [question] = await db.insert(questions).values({
    quizId: input.quizId,
    type: input.type as "multiple_choice",
    content: input.content,
    options: input.options ? JSON.stringify(input.options) : null,
    correctAnswer: input.correctAnswer ? JSON.stringify(input.correctAnswer) : null,
    explanation: input.explanation,
    order: input.order,
    timeLimit: input.timeLimit,
    points: input.points ?? 10,
  }).returning();

  return question;
}
