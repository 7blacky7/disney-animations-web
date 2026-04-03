import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { tenants } from "@/lib/db/schema/tenants";
import { eq } from "drizzle-orm";
import { DashboardShell } from "./dashboard-shell";
import type { UserRole } from "@/lib/navigation";

/**
 * Dashboard Layout — Server Component wrapper that loads session data,
 * then passes to the client-side DashboardShell.
 */

async function getLayoutData() {
  try {
    const session = await getSession();
    if (!session) return null;

    const [dbUser] = await db
      .select({ role: users.role, name: users.name, tenantId: users.tenantId })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!dbUser) return null;

    let tenantName = "Quiz Platform";
    if (dbUser.tenantId) {
      const [tenant] = await db
        .select({ name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, dbUser.tenantId));
      if (tenant) tenantName = tenant.name;
    }

    const initials = dbUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      role: dbUser.role as UserRole,
      userName: dbUser.name,
      userInitials: initials,
      tenantName,
    };
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getLayoutData();

  return (
    <DashboardShell
      role={data?.role ?? "user"}
      userName={data?.userName ?? "User"}
      userInitials={data?.userInitials ?? "U"}
      tenantName={data?.tenantName ?? "Quiz Platform"}
    >
      {children}
    </DashboardShell>
  );
}
