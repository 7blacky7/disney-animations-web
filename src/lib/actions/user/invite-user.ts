"use server";

import { db } from "@/lib/db";
import { invitations } from "@/lib/db/schema";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { randomUUID } from "crypto";

/**
 * Benutzer einladen.
 */
export async function inviteUser(
  email: string,
  role: "admin" | "department_lead" | "user",
  departmentId?: string,
) {
  const session = await requireRole("admin");
  const tenantId = await getSessionTenantId();

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Tage

  const [invitation] = await db.insert(invitations).values({
    tenantId,
    email,
    role,
    departmentId,
    invitedBy: session.user.id,
    token,
    expiresAt,
  }).returning();

  // TODO: Email senden via MS Graph oder SMTP

  return invitation;
}
