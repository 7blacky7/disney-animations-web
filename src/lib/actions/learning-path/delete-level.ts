"use server";

import { db } from "@/lib/db";
import { learningPaths, learningPathLevels } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Stufe loeschen.
 */
export async function deleteLevel(levelId: string) {
  await requireRole("department_lead");
  const tenantId = await getSessionTenantId();

  const [level] = await db
    .select({ learningPathId: learningPathLevels.learningPathId })
    .from(learningPathLevels)
    .where(eq(learningPathLevels.id, levelId))
    .limit(1);

  if (!level) throw new Error("Stufe nicht gefunden");

  const [path] = await db
    .select({ tenantId: learningPaths.tenantId })
    .from(learningPaths)
    .where(eq(learningPaths.id, level.learningPathId))
    .limit(1);

  if (!path || path.tenantId !== tenantId) throw new Error("Kein Zugriff");

  await db.delete(learningPathLevels).where(eq(learningPathLevels.id, levelId));
  return { success: true };
}
