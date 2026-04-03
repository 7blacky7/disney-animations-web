import { getDashboardStats } from "@/lib/actions/quiz-actions";
import { getSession } from "@/lib/auth/session";
import { DashboardClient } from "./dashboard-client";

/**
 * Dashboard Overview — Main landing page after login
 *
 * Server Component: Fetches aggregated stats from DB.
 * Falls back to empty state when no DB/auth available.
 */

interface DashboardStats {
  activeQuizzes: number;
  totalUsers: number;
  completedAttempts: number;
  averageScore: number;
}

async function fetchStats(): Promise<DashboardStats | null> {
  try {
    const session = await getSession();
    if (!session) return null;
    return await getDashboardStats();
  } catch (e) {
    console.error("[Dashboard] getSession error:", e);
    return null;
  }
}

export default async function DashboardPage() {
  const stats = await fetchStats();

  return <DashboardClient stats={stats} />;
}
