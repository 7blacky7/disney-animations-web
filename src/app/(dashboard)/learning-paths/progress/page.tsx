import { getLearningPathProgress } from "@/lib/actions/learning-path";
import { listLearningPaths } from "@/lib/actions/learning-path";
import { requireRouteAccess } from "@/lib/auth/session";
import { ProgressClient } from "./progress-client";

/**
 * Lernpfad-Fortschritt — User sieht eigenen Progress.
 * Server Component: Laedt Lernpfade + Fortschritt.
 */

export default async function ProgressPage() {
  const { role } = await requireRouteAccess("/learning-paths");

  const paths = await listLearningPaths().catch(() => []);

  // Fortschritt fuer jeden publizierten Lernpfad laden
  const publishedPaths = paths.filter((p) => p.isPublished);
  const progressData = await Promise.all(
    publishedPaths.map(async (path) => {
      const progress = await getLearningPathProgress(path.id).catch(() => ({
        totalLevels: 0,
        completedLevels: 0,
        levels: [],
      }));
      return { ...path, progress };
    }),
  );

  return <ProgressClient paths={progressData} userRole={role} />;
}
