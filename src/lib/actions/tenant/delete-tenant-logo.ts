"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { tenantLogos } from "@/lib/db/schema/tenant-logos";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteTenantLogo() {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Kein Mandant zugeordnet");

  await db.delete(tenantLogos).where(eq(tenantLogos.tenantId, tenantId));
  await db.update(tenants).set({ logoUrl: null }).where(eq(tenants.id, tenantId));

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}
