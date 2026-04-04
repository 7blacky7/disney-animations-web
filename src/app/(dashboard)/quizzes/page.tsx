import { listQuizzes } from "@/lib/actions/quiz-actions";
import { listDepartments } from "@/lib/actions/user-actions";
import { requireRouteAccess } from "@/lib/auth/session";
import { QuizzesClient } from "./quizzes-client";

/**
 * Quiz Manager — Lists all quizzes with status, filters, create + assign
 * Server Component: Fetches quizzes + departments from DB.
 * RBAC: Erfordert mindestens "department_lead"-Rolle.
 */

export default async function QuizzesPage() {
  await requireRouteAccess("/quizzes");

  const quizzes = await listQuizzes().catch(() => []);
  const departments = await listDepartments().catch(() => []);

  return (
    <QuizzesClient
      initialQuizzes={quizzes}
      departments={departments}
      hasData={true}
    />
  );
}
