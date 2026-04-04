"use server";

import { db } from "@/lib/db";
import { quizResults } from "@/lib/db/schema";
import { requireSession } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";

/**
 * Eigene Ergebnisse abrufen.
 */
export async function getMyResults() {
  const session = await requireSession();

  const results = await db
    .select()
    .from(quizResults)
    .where(eq(quizResults.userId, session.user.id))
    .orderBy(desc(quizResults.completedAt));

  return results;
}
