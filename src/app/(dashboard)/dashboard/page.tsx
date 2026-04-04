import { getDashboardStats, listQuizzes } from "@/lib/actions/quiz-actions";
import { requireRouteAccess } from "@/lib/auth/session";
import { DashboardClient } from "./dashboard-client";

/**
 * Dashboard Overview — Main landing page after login
 *
 * Server Component: Fetches aggregated stats + available quizzes from DB.
 * RBAC: Erfordert mindestens "user"-Rolle (alle eingeloggten User).
 */

export default async function DashboardPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /dashboard
  await requireRouteAccess("/dashboard");

  // Sequential calls (headers() nicht thread-safe in Next.js 16)
  const stats = await getDashboardStats().catch(() => null);
  const quizzes = await listQuizzes().catch(() => []);

  return <DashboardClient stats={stats} quizzes={quizzes} />;
}
