import { getMyResults } from "@/lib/actions/quiz-actions";
import { getSession } from "@/lib/auth/session";
import { MyResultsClient } from "./my-results-client";

/**
 * My Results — User's personal quiz history
 * Server Component: Fetches personal results from DB.
 */

async function fetchResults() {
  try {
    const session = await getSession();
    if (!session) return null;
    return await getMyResults();
  } catch {
    return null;
  }
}

export default async function MyResultsPage() {
  const results = await fetchResults();

  return (
    <MyResultsClient
      results={results ?? []}
      hasData={results !== null}
    />
  );
}
