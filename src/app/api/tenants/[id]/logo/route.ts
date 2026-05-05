import { db } from "@/lib/db";
import { tenantLogos } from "@/lib/db/schema/tenant-logos";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

/**
 * GET /api/tenants/[id]/logo
 * — Streamt das Tenant-Logo aus der DB mit ETag-Caching.
 * Öffentlich (kein Auth-Check), weil Logos auch auf der Landing Page erscheinen.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [logo] = await db
    .select()
    .from(tenantLogos)
    .where(eq(tenantLogos.tenantId, id))
    .limit(1);

  if (!logo) {
    return new Response("Not Found", { status: 404 });
  }

  const etag = `"${logo.updatedAt.getTime()}-${logo.size}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  return new Response(logo.data as unknown as BodyInit, {
    headers: {
      "Content-Type": logo.contentType,
      "Content-Length": String(logo.size),
      "Cache-Control": "public, max-age=300, must-revalidate",
      "Content-Disposition": "inline",
      ETag: etag,
    },
  });
}
