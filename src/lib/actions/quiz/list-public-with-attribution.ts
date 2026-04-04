"use server";

import { db } from "@/lib/db";
import { quizzes, tenants } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Oeffentliche Quizzes mit optionaler Firmen-Attribution.
 * Respektiert die quizAttribution-Einstellung des Tenants.
 */
export async function listPublicQuizzesWithAttribution() {
  const result = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      quizMode: quizzes.quizMode,
      tenantName: tenants.name,
      tenantLogoUrl: tenants.logoUrl,
      quizAttribution: tenants.quizAttribution,
    })
    .from(quizzes)
    .innerJoin(tenants, eq(quizzes.tenantId, tenants.id))
    .where(
      and(
        eq(quizzes.visibility, "global"),
        eq(quizzes.isPublished, true),
      ),
    )
    .orderBy(desc(quizzes.createdAt))
    .limit(12);

  // Attribution-Filter: Nur Firmennamen zeigen wenn quizAttribution="named"
  return result.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    quizMode: q.quizMode,
    tenantName: q.quizAttribution === "named" ? q.tenantName : null,
    tenantLogoUrl: q.quizAttribution === "named" ? q.tenantLogoUrl : null,
  }));
}
