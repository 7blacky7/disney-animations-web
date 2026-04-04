"use server";

import { db } from "@/lib/db";
import { quizzes } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import type { CreateQuizInput } from "./_types";

/**
 * Erstellt ein neues Quiz.
 * Berechtigung: admin oder department_lead
 */
export async function createQuiz(input: CreateQuizInput) {
  const session = await requireRole("department_lead");
  const userId = session.user.id;
  const tenantId = await getSessionTenantId();

  if (!tenantId) {
    throw new Error("Kein Mandant zugeordnet");
  }

  const [quiz] = await db.insert(quizzes).values({
    tenantId,
    createdBy: userId,
    title: input.title,
    description: input.description,
    quizMode: input.quizMode,
    visibility: input.visibility,
    isPracticeAllowed: input.isPracticeAllowed ?? true,
    departmentId: input.departmentId,
    isPublished: true,
  }).returning();

  return quiz;
}
