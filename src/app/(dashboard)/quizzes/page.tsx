import { listQuizzes } from "@/lib/actions/quiz-actions";
import { getSession } from "@/lib/auth/session";
import { QuizzesClient } from "./quizzes-client";

/**
 * Quiz Manager — Lists all quizzes with status, filters, and create button
 * Server Component: Fetches quizzes from DB.
 */

async function fetchQuizzes() {
  try {
    const session = await getSession();
    if (!session) return null;
    return await listQuizzes();
  } catch {
    return null;
  }
}

export default async function QuizzesPage() {
  const quizzes = await fetchQuizzes();

  return (
    <QuizzesClient
      initialQuizzes={quizzes ?? []}
      hasData={quizzes !== null}
    />
  );
}
