import { listQuizzes } from "@/lib/actions/quiz-actions";
import { requireRouteAccess } from "@/lib/auth/session";
import { QuizzesClient } from "./quizzes-client";

/**
 * Quiz Manager — Lists all quizzes with status, filters, and create button
 * Server Component: Fetches quizzes from DB.
 * RBAC: Erfordert mindestens "department_lead"-Rolle.
 */

export default async function QuizzesPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /quizzes
  await requireRouteAccess("/quizzes");

  const quizzes = await listQuizzes().catch(() => []);

  return (
    <QuizzesClient
      initialQuizzes={quizzes}
      hasData={true}
    />
  );
}
