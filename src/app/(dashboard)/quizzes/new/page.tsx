import { requireRouteAccess } from "@/lib/auth/session";
import { NewQuizClient } from "./new-quiz-client";

/**
 * Quiz Builder — Server Component wrapper with RBAC guard.
 * RBAC: Erfordert mindestens "department_lead"-Rolle.
 */

export default async function NewQuizPage() {
  // RBAC-Guard: Prueft Auth + Rollen-Berechtigung fuer /quizzes
  await requireRouteAccess("/quizzes");

  return <NewQuizClient />;
}
