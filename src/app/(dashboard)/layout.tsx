import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { canAccessRoute } from "@/lib/auth/rbac";
import type { UserRole as RbacRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema/tenants";
import { departments } from "@/lib/db/schema/departments";
import { departmentLogos } from "@/lib/db/schema/department-logos";
import { eq } from "drizzle-orm";
import { DashboardShell } from "./dashboard-shell";
import type { UserRole } from "@/lib/navigation";

/**
 * Dashboard Layout — Server Component.
 * Lädt Tenant-Name + Logo + ggf. Department-Name + Logo für Branding.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, name, tenantId, departmentId } = await requireAuth();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/dashboard";

  if (!canAccessRoute(role as RbacRole, pathname)) {
    redirect("/dashboard");
  }

  let tenantName = "Quiz Studio";
  let tenantLogoUrl: string | null = null;
  if (tenantId) {
    const [tenant] = await db
      .select({ name: tenants.name, logoUrl: tenants.logoUrl })
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    if (tenant) {
      tenantName = tenant.name;
      tenantLogoUrl = tenant.logoUrl;
    }
  }

  let departmentName: string | null = null;
  let departmentLogoUrl: string | null = null;
  if (departmentId) {
    const [dept] = await db
      .select({
        name: departments.name,
        logoUpdatedAt: departmentLogos.updatedAt,
      })
      .from(departments)
      .leftJoin(departmentLogos, eq(departmentLogos.departmentId, departments.id))
      .where(eq(departments.id, departmentId))
      .limit(1);
    if (dept) {
      departmentName = dept.name;
      if (dept.logoUpdatedAt) {
        departmentLogoUrl = `/api/departments/${departmentId}/logo?v=${dept.logoUpdatedAt.getTime()}`;
      }
    }
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DashboardShell
      role={role as UserRole}
      userName={name}
      userInitials={initials}
      tenantName={tenantName}
      tenantLogoUrl={tenantLogoUrl}
      departmentName={departmentName}
      departmentLogoUrl={departmentLogoUrl}
    >
      {children}
    </DashboardShell>
  );
}
