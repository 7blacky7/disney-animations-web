import { listLearningPaths } from "@/lib/actions/learning-path-actions";
import { requireRouteAccess } from "@/lib/auth/session";
import { LearningPathsClient } from "./learning-paths-client";

/**
 * Learning Paths — Lernpfad-Uebersicht
 *
 * Server Component: Laedt Lernpfade des eigenen Tenants.
 * RBAC:
 * - user: Sieht publizierte Lernpfade (zum Durcharbeiten)
 * - department_lead+: Sieht alle + kann erstellen/bearbeiten
 */

export default async function LearningPathsPage() {
  const { role } = await requireRouteAccess("/learning-paths");

  const paths = await listLearningPaths().catch(() => []);

  return <LearningPathsClient initialPaths={paths} userRole={role} />;
}
