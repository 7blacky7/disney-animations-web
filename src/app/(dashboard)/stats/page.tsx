import { getQuizStats, getMyResults } from "@/lib/actions/quiz";
import { requireRouteAccess } from "@/lib/auth/session";
import { StatsClient } from "./stats-client";

/**
 * Statistics Dashboard — Phase 7
 * Server Component: Fetches quiz stats and personal results from DB.
 * RBAC: Erfordert mindestens "department_lead"-Rolle.
 */

export default async function StatsPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /stats
  await requireRouteAccess("/stats");

  // Sequential calls to avoid parallel getSession() issues in Next.js 16
  const quizStats = await getQuizStats().catch(() => []);
  const personalResults = await getMyResults().catch(() => []);

  return (
    <StatsClient
      quizStats={quizStats}
      personalResults={personalResults}
      hasData={true}
    />
  );
}
