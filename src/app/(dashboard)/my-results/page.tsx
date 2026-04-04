import { getMyResults } from "@/lib/actions/quiz-actions";
import { requireRouteAccess } from "@/lib/auth/session";
import { MyResultsClient } from "./my-results-client";

/**
 * My Results — User's personal quiz history
 * Server Component: Fetches personal results from DB.
 * RBAC: Erfordert mindestens "user"-Rolle (alle eingeloggten User).
 */

export default async function MyResultsPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /my-results
  await requireRouteAccess("/my-results");

  const results = await getMyResults().catch(() => []);

  return (
    <MyResultsClient
      results={results}
      hasData={true}
    />
  );
}
