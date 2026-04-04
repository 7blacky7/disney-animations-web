import { getTeamLearningProgress } from "@/lib/actions/learning-path";
import { requireRouteAccess } from "@/lib/auth/session";
import { TeamProgressClient } from "./team-progress-client";

/**
 * Team-Fortschritt — DeptLead/Admin sieht Fortschritt aller Mitarbeiter.
 * RBAC: Mindestens department_lead.
 */

export default async function TeamProgressPage() {
  await requireRouteAccess("/learning-paths");

  const teamData = await getTeamLearningProgress().catch(() => ({
    members: [],
    paths: [],
  }));

  return <TeamProgressClient teamData={teamData} />;
}
