"use server";

import { db } from "@/lib/db";
import { learningPaths, learningPathLevels } from "@/lib/db/schema";
import { getSessionUserData } from "@/lib/auth/session";
import { eq, desc, asc, count } from "drizzle-orm";

/**
 * Lernpfade des eigenen Tenants auflisten.
 * Fuer alle eingeloggten User sichtbar (publizierte Pfade).
 * Admin/DeptLead sehen auch unveroffentlichte.
 */
export async function listLearningPaths() {
  const { tenantId, departmentId, role } = await getSessionUserData();

  const result = await db
    .select({
      id: learningPaths.id,
      title: learningPaths.title,
      description: learningPaths.description,
      language: learningPaths.language,
      isPublished: learningPaths.isPublished,
      sortOrder: learningPaths.sortOrder,
      createdAt: learningPaths.createdAt,
      levelCount: count(learningPathLevels.id),
    })
    .from(learningPaths)
    .leftJoin(learningPathLevels, eq(learningPathLevels.learningPathId, learningPaths.id))
    .where(eq(learningPaths.tenantId, tenantId))
    .groupBy(learningPaths.id)
    .orderBy(asc(learningPaths.sortOrder), desc(learningPaths.createdAt));

  // User sehen nur publizierte Pfade (ggf. mit Dept-Filter)
  if (role === "user") {
    return result.filter((p) => p.isPublished);
  }

  return result;
}
