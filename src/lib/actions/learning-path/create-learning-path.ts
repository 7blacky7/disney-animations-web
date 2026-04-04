"use server";

import { db } from "@/lib/db";
import { learningPaths } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import type { CreateLearningPathInput } from "./_types";

/**
 * Neuen Lernpfad erstellen.
 * RBAC: department_lead+
 */
export async function createLearningPath(input: CreateLearningPathInput) {
  const session = await requireRole("department_lead");
  const tenantId = await getSessionTenantId();

  const [path] = await db.insert(learningPaths).values({
    tenantId,
    createdBy: session.user.id,
    title: input.title,
    description: input.description,
    language: input.language,
    departmentId: input.departmentId,
  }).returning();

  return path;
}
