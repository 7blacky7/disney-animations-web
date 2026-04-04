import { getDashboardStats } from "@/lib/actions/quiz-actions";
import { requireRouteAccess } from "@/lib/auth/session";
import { DashboardClient } from "./dashboard-client";

/**
 * Dashboard Overview — Main landing page after login
 *
 * Server Component: Fetches aggregated stats from DB.
 * RBAC: Erfordert mindestens "user"-Rolle (alle eingeloggten User).
 */

export default async function DashboardPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /dashboard
  await requireRouteAccess("/dashboard");

  const stats = await getDashboardStats().catch(() => null);

  return <DashboardClient stats={stats} />;
}
