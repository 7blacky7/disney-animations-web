"use server";

import { db } from "@/lib/db";
import { learningPaths } from "@/lib/db/schema";
import { requireSession, getSessionUserData } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

/**
 * Lernpfad loeschen.
 * RBAC: Ersteller oder admin (gleicher Tenant)
 */
export async function deleteLearningPath(pathId: string) {
  const session = await requireSession();
  const { tenantId, role } = await getSessionUserData();

  const [existing] = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.id, pathId))
    .limit(1);

  if (!existing) throw new Error("Lernpfad nicht gefunden");
  if (existing.tenantId !== tenantId) throw new Error("Kein Zugriff");
  if (existing.createdBy !== session.user.id && role !== "admin" && role !== "super_admin") {
    throw new Error("Keine Berechtigung");
  }

  await db.delete(learningPaths).where(eq(learningPaths.id, pathId));
  return { success: true };
}
