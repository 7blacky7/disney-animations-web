"use server";

import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { CreateQuestionInput } from "./_types";

/**
 * Frage aktualisieren.
 */
export async function updateQuestion(
  questionId: string,
  data: Partial<CreateQuestionInput>,
) {
  await requireRole("department_lead");

  const [updated] = await db
    .update(questions)
    .set(data as Record<string, unknown>)
    .where(eq(questions.id, questionId))
    .returning();

  return updated;
}
