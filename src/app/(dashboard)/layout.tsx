import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { canAccessRoute } from "@/lib/auth/rbac";
import type { UserRole as RbacRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema/tenants";
import { eq } from "drizzle-orm";
import { DashboardShell } from "./dashboard-shell";
import type { UserRole } from "@/lib/navigation";

/**
 * Dashboard Layout — Server Component wrapper that loads session data,
 * then passes to the client-side DashboardShell.
 *
 * Auth-Guard: Unauthentifizierte User werden zu /login redirected.
 * RBAC-Guard: canAccessRoute() prueft ob die Rolle fuer den Pfad ausreicht.
 * requireAuth() laedt Session + User-Daten aus der DB (nicht aus der Session).
 *
 * WICHTIG: headers() wird sequentiell aufgerufen (nicht thread-safe bei parallelen Aufrufen).
 */

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth-Guard: redirect zu /login wenn nicht eingeloggt
  const { role, name, tenantId } = await requireAuth();

  // RBAC-Guard: Pathname aus Proxy-Header lesen, Route-Berechtigung pruefen
  // headers() sequentiell nach requireAuth() aufrufen (nicht parallel!)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/dashboard";

  if (!canAccessRoute(role as RbacRole, pathname)) {
    redirect("/dashboard");
  }

  // Tenant-Name laden (sequentiell wegen headers()-Einschraenkung)
  let tenantName = "Quiz Platform";
  if (tenantId) {
    const [tenant] = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    if (tenant) tenantName = tenant.name;
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
    >
      {children}
    </DashboardShell>
  );
}
