import { db } from "@/lib/db";
import { departmentLogos } from "@/lib/db/schema/department-logos";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

/**
 * GET /api/departments/[id]/logo
 * Streamt das Department-Logo aus der DB mit ETag-Caching.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [logo] = await db
    .select()
    .from(departmentLogos)
    .where(eq(departmentLogos.departmentId, id))
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
