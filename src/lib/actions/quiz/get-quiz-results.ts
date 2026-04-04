"use server";

import { db } from "@/lib/db";
import { quizResults } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";

/**
 * Ergebnisse eines Quiz abrufen (fuer Admins/Leiter).
 */
export async function getQuizResults(quizId: string) {
  await requireRole("department_lead");

  const results = await db
    .select()
    .from(quizResults)
    .where(eq(quizResults.quizId, quizId))
    .orderBy(desc(quizResults.score));

  return results;
}
