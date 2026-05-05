"use server";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";
import { departmentLogos } from "@/lib/db/schema/department-logos";
import { requireRole, getSessionTenantId } from "@/lib/auth/session";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MAX_SIZE_BYTES = 500 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

export async function uploadDepartmentLogo(departmentId: string, formData: FormData) {
  await requireRole("admin");
  const tenantId = await getSessionTenantId();
  if (!tenantId) throw new Error("Kein Mandant zugeordnet");

  const [dept] = await db
    .select({ id: departments.id, tenantId: departments.tenantId })
    .from(departments)
    .where(and(eq(departments.id, departmentId), eq(departments.tenantId, tenantId)))
    .limit(1);
  if (!dept) throw new Error("Abteilung nicht gefunden");

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
    .insert(departmentLogos)
    .values({
      departmentId,
      data: buffer,
      contentType: file.type,
      size: file.size,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: departmentLogos.departmentId,
      set: {
        data: buffer,
        contentType: file.type,
        size: file.size,
        updatedAt: now,
      },
    });

  revalidatePath("/departments");
  return { success: true, version: now.getTime() };
}
