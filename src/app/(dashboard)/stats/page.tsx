import { getQuizStats, getMyResults } from "@/lib/actions/quiz-actions";
import { getSession } from "@/lib/auth/session";
import { StatsClient } from "./stats-client";

/**
 * Statistics Dashboard — Phase 7
 * Server Component: Fetches quiz stats and personal results from DB.
 */

async function fetchStats() {
  try {
    const session = await getSession();
    if (!session) return null;

    const [quizStats, personalResults] = await Promise.allSettled([
      getQuizStats(),
      getMyResults(),
    ]);

    return {
      quizStats: quizStats.status === "fulfilled" ? quizStats.value : [],
      personalResults: personalResults.status === "fulfilled" ? personalResults.value : [],
    };
  } catch {
    return null;
  }
}

export default async function StatsPage() {
  const data = await fetchStats();

  return (
    <StatsClient
      quizStats={data?.quizStats ?? []}
      personalResults={data?.personalResults ?? []}
      hasData={data !== null}
    />
  );
}
