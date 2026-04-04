"use server";

import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Frage loeschen.
 */
export async function deleteQuestion(questionId: string) {
  await requireRole("department_lead");
  await db.delete(questions).where(eq(questions.id, questionId));
  return { success: true };
}
