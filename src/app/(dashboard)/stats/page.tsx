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

    // Sequential calls to avoid parallel getSession() issues in Next.js 16
    const quizStats = await getQuizStats().catch(() => []);
    const personalResults = await getMyResults().catch(() => []);

    return { quizStats, personalResults };
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
