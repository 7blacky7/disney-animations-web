"use server";

import { db } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Oeffentliche Quizzes auflisten — KEINE Auth erforderlich.
 * Zeigt nur globale, publizierte Quizzes.
 */
export async function listPublicQuizzes() {
  const result = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      quizMode: quizzes.quizMode,
    })
    .from(quizzes)
    .where(
      and(
        eq(quizzes.visibility, "global"),
        eq(quizzes.isPublished, true),
      ),
    )
    .orderBy(desc(quizzes.createdAt))
    .limit(6);

  return result;
}
