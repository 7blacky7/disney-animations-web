import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import type { UserRole } from "./rbac";
import { hasRole, canAccessRoute, ROUTE_PERMISSIONS } from "./rbac";

/**
 * Server-seitige Session-Helpers
 *
 * Fuer Server Components und Server Actions.
 */

/**
 * Aktuelle Session abrufen (Server-Side).
 * Gibt null zurueck wenn nicht eingeloggt.
 */
export async function getSession() {
  try {
    // Next.js 16 headers() returns ReadonlyHeaders (Promise-based).
    // better-auth needs a plain Headers object for iteration.
    const readonlyHeaders = await headers();
    const plainHeaders = new Headers();
    readonlyHeaders.forEach((value, key) => {
      plainHeaders.set(key, value);
    });

    const session = await auth.api.getSession({
      headers: plainHeaders,
    });
    return session;
  } catch (e) {
    console.error("[getSession] ERROR:", (e as Error).message);
    return null;
  }
}

/**
 * Session abrufen oder Redirect zu Login.
 * Wirft Error wenn nicht eingeloggt (fuer Server Actions).
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Nicht authentifiziert");
  }
  return session;
}

/**
 * Tenant-ID des eingeloggten Users aus der DB laden.
 * better-auth Session enthält keine custom User-Felder (tenantId, role, departmentId).
 */
export async function getSessionTenantId(): Promise<string> {
  const session = await requireSession();
  const [dbUser] = await db
    .select({ tenantId: users.tenantId, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));
  return dbUser?.tenantId ?? "";
}

/**
 * Session mit Rollen-Check.
 * Wirft Error wenn Rolle nicht ausreicht.
 */
export async function requireRole(requiredRole: UserRole) {
  const session = await requireSession();
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));
  const userRole = dbUser?.role as UserRole | undefined;

  if (!userRole || !hasRole(userRole, requiredRole)) {
    throw new Error(`Zugriff verweigert. Erforderliche Rolle: ${requiredRole}`);
  }

  return session;
}

/**
 * Auth-Guard fuer Dashboard: Prueft Session und gibt User-Daten zurueck.
 * Redirected zu /login wenn nicht authentifiziert.
 *
 * WICHTIG: redirect() muss AUSSERHALB von try/catch aufgerufen werden,
 * da es intern einen Error wirft den Next.js abfaengt.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [dbUser] = await db
    .select({ role: users.role, name: users.name, tenantId: users.tenantId })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!dbUser) {
    redirect("/login");
  }

  return {
    session,
    role: dbUser.role as UserRole,
    name: dbUser.name,
    tenantId: dbUser.tenantId,
  };
}

/**
 * RBAC-Guard fuer einzelne Routen.
 * Prueft ob der User die noetige Rolle fuer den angegebenen Pfad hat.
 * Redirected zu /dashboard wenn Zugriff verweigert.
 *
 * @param routePath - Der Dashboard-Pfad (z.B. "/users", "/settings")
 */
export async function requireRouteAccess(routePath: string) {
  const { session, role, name, tenantId } = await requireAuth();

  if (!canAccessRoute(role, routePath)) {
    redirect("/dashboard");
  }

  return { session, role, name, tenantId };
}
