"use server";

import { db } from "@/lib/db";
import { learningPaths, learningPathLevels } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import type { CreateLevelInput } from "./_types";

/**
 * Stufe aktualisieren.
 */
export async function updateLevel(
  levelId: string,
  data: Partial<Omit<CreateLevelInput, "learningPathId">>,
) {
  await requireRole("department_lead");
  const tenantId = await getSessionTenantId();

  // Level -> Path -> Tenant Check
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

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.minScore !== undefined) updateData.minScore = data.minScore;
  if (data.levelNumber !== undefined) updateData.levelNumber = data.levelNumber;
  if (data.referenceUrls !== undefined) updateData.referenceUrls = JSON.stringify(data.referenceUrls);

  const [updated] = await db
    .update(learningPathLevels)
    .set(updateData)
    .where(eq(learningPathLevels.id, levelId))
    .returning();

  return updated;
}
