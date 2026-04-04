import { getDashboardStats, listQuizzes, getMyAssignedQuizzes } from "@/lib/actions/quiz-actions";
import { requireRouteAccess, getSessionUserData } from "@/lib/auth/session";
import { DashboardClient } from "./dashboard-client";

/**
 * Dashboard Overview — Main landing page after login
 *
 * Server Component: Fetches aggregated stats + available quizzes from DB.
 * Fuer Mitarbeiter: Zeigt zusaetzlich zugewiesene Quizzes.
 * RBAC: Erfordert mindestens "user"-Rolle (alle eingeloggten User).
 */

export default async function DashboardPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /dashboard
  const { role } = await requireRouteAccess("/dashboard");

  // Sequential calls (headers() nicht thread-safe in Next.js 16)
  const stats = await getDashboardStats().catch(() => null);
  const quizzes = await listQuizzes().catch(() => []);
  const assignedQuizzes = await getMyAssignedQuizzes().catch(() => []);

  return (
    <DashboardClient
      stats={stats}
      quizzes={quizzes}
      assignedQuizzes={assignedQuizzes}
      userRole={role}
    />
  );
}
