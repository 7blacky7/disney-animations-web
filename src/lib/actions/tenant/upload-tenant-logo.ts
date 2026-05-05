"use server";

import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { tenantLogos } from "@/lib/db/schema/tenant-logos";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MAX_SIZE_BYTES = 500 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

/**
 * Logo eines Tenants hochladen. Speichert Binärdaten in tenant_logos.
 * Setzt zusätzlich tenants.logoUrl auf die API-Route für direkte Verwendung in <img>.
 */
export async function uploadTenantLogo(formData: FormData) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Kein Mandant zugeordnet");

  const file = formData.get("logo");
  if (!(file instanceof File)) {
    throw new Error("Keine Datei übergeben");
  }
  if (file.size === 0) {
    throw new Error("Datei ist leer");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`Datei zu groß (max ${Math.floor(MAX_SIZE_BYTES / 1024)} KB)`);
  }
  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) {
    throw new Error(`Format nicht erlaubt: ${file.type || "unbekannt"}. Erlaubt: PNG, JPEG, WebP.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const now = new Date();

  await db
    .insert(tenantLogos)
    .values({
      tenantId,
      data: buffer,
      contentType: file.type,
      size: file.size,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: tenantLogos.tenantId,
      set: {
        data: buffer,
        contentType: file.type,
        size: file.size,
        updatedAt: now,
      },
    });

  await db
    .update(tenants)
    .set({ logoUrl: `/api/tenants/${tenantId}/logo?v=${now.getTime()}` })
    .where(eq(tenants.id, tenantId));

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}
